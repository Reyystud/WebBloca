'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useAuth } from './auth-context'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  isLoading: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalPrice: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('bloca_cart')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      localStorage.removeItem('bloca_cart')
    }
  }
  return []
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const syncRef = useRef<string | boolean>(false)
  const { user } = useAuth()

  useEffect(() => {
    const stored = getStoredCart()
    setItems(stored)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('bloca_cart', JSON.stringify(items))
    }
  }, [items, isLoading])

  useEffect(() => {
    if (isLoading) return
    
    // We want to run mergeCart once per user session
    // so we use a ref tied to the user's ID (or 'guest')
    const currentSessionId = user?.id || 'guest'
    if (syncRef.current === currentSessionId) return
    syncRef.current = currentSessionId as any

    const mergeCart = async () => {
      try {
        const res = await fetch('/api/auth', { method: 'POST' })
        if (!res.ok) return

        const stored = getStoredCart()
        if (stored.length === 0) {
          const cartRes = await fetch('/api/cart')
          if (cartRes.ok) {
            const dbCart = await cartRes.json()
            if (Array.isArray(dbCart) && dbCart.length > 0) {
              setItems((prev) => {
                const combined = [...prev]
                dbCart.forEach((item: CartItem) => {
                  const existing = combined.find(i => i.id === item.id)
                  if (existing) {
                    existing.quantity = Math.max(existing.quantity, item.quantity)
                  } else {
                    combined.push(item)
                  }
                })
                return combined
              })
            }
          }
          return
        }

        const mergeRes = await fetch('/api/cart/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: stored }),
        })

        if (mergeRes.ok) {
          const mergedCart = await mergeRes.json()
          if (Array.isArray(mergedCart)) {
            setItems((prev) => {
              const combined = [...prev]
              mergedCart.forEach((item: CartItem) => {
                const existing = combined.find(i => i.id === item.id)
                if (existing) {
                  existing.quantity = Math.max(existing.quantity, item.quantity)
                } else {
                  combined.push(item)
                }
              })
              return combined
            })
          }
        }
      } catch {
        // Keep using localStorage cart
      }
    }

    mergeCart()
  }, [isLoading, user])

  const syncToDb = useCallback(async (newItems: CartItem[]) => {
    try {
      const res = await fetch('/api/auth', { method: 'POST' })
      if (!res.ok) return

      const dbCartRes = await fetch('/api/cart')
      if (!dbCartRes.ok) return
      const dbCart = await dbCartRes.json()

      const dbProductIds = new Set(dbCart.map((item: any) => item.id))
      const itemsToAdd = newItems.filter(item => !dbProductIds.has(item.id))

      if (itemsToAdd.length > 0) {
        await fetch('/api/cart/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsToAdd }),
        })
      }
    } catch {
      // Silent fail - localStorage is the fallback
    }
  }, [])

  useEffect(() => {
    if (user && !isLoading && items.length > 0) {
      syncToDb(items)
    }
  }, [user, isLoading]) // intentionally not including items or syncToDb to only trigger on user change/load

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)
      let newItems: CartItem[]
      if (existingItem) {
        newItems = prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      } else {
        newItems = [...prevItems, { ...item, quantity: 1 }]
      }

      syncToDb(newItems)
      return newItems
    })
    setIsOpen(true)
  }, [syncToDb])

  const removeItem = useCallback((id: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((i) => i.id !== id)
      syncToDb(newItems)
      return newItems
    })

    fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id }),
    }).catch(() => {})
  }, [syncToDb])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    setItems((prevItems) => {
      const newItems = prevItems.map((i) => (i.id === id ? { ...i, quantity } : i))
      syncToDb(newItems)
      return newItems
    })
  }, [removeItem, syncToDb])

  const clearCart = useCallback(() => {
    setItems([])
    fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {})
  }, [])

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + Number(item.price) * item.quantity, 0)
  }, [items])

  const getItemCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }, [items])

  const openCart = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeCart = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        getTotalPrice,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}