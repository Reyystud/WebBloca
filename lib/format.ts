export function formatPrice(price: number | string): string {
  return `Rp ${Number(price).toLocaleString('id-ID')}`
}

export function formatPriceShort(price: number | string): string {
  const num = Number(price)
  if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `Rp ${(num / 1000).toFixed(0)}K`
  return `Rp ${num.toLocaleString('id-ID')}`
}