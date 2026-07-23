import { base } from '$app/paths'

export function withBase(path: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(path)) return path

  const normalized = path.startsWith('/') ? path : `/${path}`

  if (base && (normalized === base || normalized.startsWith(`${base}/`))) {
    return normalized
  }

  return `${base}${normalized}`
}
