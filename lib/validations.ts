import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  price: z.number().positive('Price must be positive'),
  image: z.string().min(1, 'Image is required'),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional().nullable(),
  isSale: z.boolean().optional().default(false),
  description: z.string().optional().nullable(),
  features: z.union([z.string(), z.array(z.string()), z.record(z.string())]).optional().nullable(),
  stock: z.number().int().min(0).optional().default(100),
})

export const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  price: z.number().positive().optional(),
  image: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  subCategory: z.string().optional().nullable(),
  isSale: z.boolean().optional(),
  description: z.string().optional().nullable(),
  features: z.union([z.string(), z.array(z.string()), z.record(z.string())]).optional().nullable(),
  stock: z.number().int().min(0).optional(),
  isDeleted: z.boolean().optional(),
})

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive().optional().default(1),
})

export const removeFromCartSchema = z.object({
  productId: z.string().optional(),
})

export const mergeCartSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    image: z.string(),
    quantity: z.number().int().positive(),
  })),
})

export const shippingAddressSchema = z.object({
  shippingName: z.string().min(1, 'Name is required').max(100),
  shippingPhone: z.string().min(1, 'Phone is required').max(20),
  shippingAddress: z.string().min(1, 'Address is required').max(500),
  shippingCity: z.string().min(1, 'City is required').max(100),
  shippingProvince: z.string().min(1, 'Province is required').max(100),
  shippingPostalCode: z.string().min(1, 'Postal code is required').max(10),
})

export const createOrderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().int().positive(),
  })),
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.string().optional(),
  shippingCost: z.number().min(0).optional().default(0),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'EXPIRED']).optional(),
  trackingNumber: z.string().optional().nullable(),
  trackingProvider: z.string().optional().nullable(),
  shippingAddress: z.string().optional(),
})

export const updateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  tier: z.enum(['SILVER', 'GOLD', 'PLATINUM']).optional(),
  name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  points: z.number().int().optional(),
})

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type AddToCartInput = z.infer<typeof addToCartSchema>
export type MergeCartInput = z.infer<typeof mergeCartSchema>
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>