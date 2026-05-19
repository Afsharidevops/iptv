import type { HTMLPreviewField } from '$lib/components/HTMLPreview/types'

export type Type = {
  hash: string
  channelId: string
  feedId: string
  site: string
  siteName: string
  siteId: string
  lang: string
  url: string
  streamId: string
  fieldset?: HTMLPreviewField[]
}
