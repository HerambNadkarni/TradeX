export function formatCurrency(value, options = {}) {
  const { compact = false } = options
  const num = Number(value) || 0

  if (compact && Math.abs(num) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(num)
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatPercent(value) {
  const num = Number(value) || 0
  const sign = num >= 0 ? "+" : ""
  return `${sign}${num.toFixed(2)}%`
}
