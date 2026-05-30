import type { HTMLPreviewField } from '$lib/components/HTMLPreview/types'

export type Type = {
  hash: string
  id: string
  channelId: string
  feedId: string
  fullTitle: string
  verticalResolution: number
  url: string
  title: string
  referrer: string
  userAgent: string
  quality: string
  label: string
  countryCode: string
  editUrl?: string
  reportUrl?: string
  logoUrl?: string
  categories?: string[]
  fieldset?: HTMLPreviewField[]
}

export type Snippet = {
  channelId: string
  hash: string
}
