import type { HTMLPreviewField } from '$lib/components/HTMLPreview/types'

export type Type = {
  hash: string
  channelId: string
  feedId: string
  url: string
  inUse: boolean
  width: number
  height: number
  format: string
  tags: string[]
  editUrl?: string
  removeUrl?: string
  hasMainFeed?: boolean
  fieldset?: HTMLPreviewField[]
  streamId: string
  displayName?: string
}

export type Snippet = {
  width: number
  height: number
  url: string
  displayName: string
}
