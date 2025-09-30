import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) {
    return '0 DA'
  }
  if (price >= 1_000_000_000) {
    return `${(price / 1_000_000_000).toFixed(1)}B DA`
  } else if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(1)}M DA`
  } else if (price >= 1_000) {
    return `${(price / 1_000).toFixed(0)}K DA`
  }
  return `${price.toLocaleString()} DA`
}

export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) {
    return '0'
  }
  return num.toLocaleString()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}