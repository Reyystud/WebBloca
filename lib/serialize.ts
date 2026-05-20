export function serializeDecimal(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) return obj.map(serializeDecimal)
    const result: any = {}
    for (const key of Object.keys(obj)) {
      const val = obj[key]
      if (val && typeof val === 'object' && typeof val.toString === 'function' && val.constructor?.name === 'Decimal') {
        result[key] = Number(val.toString())
      } else if (val instanceof Date) {
        result[key] = val.toISOString()
      } else if (typeof val === 'object') {
        result[key] = serializeDecimal(val)
      } else {
        result[key] = val
      }
    }
    return result
  }
  return obj
}