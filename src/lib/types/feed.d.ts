import type { HTMLPreviewField } from '$lib/components/HTMLPreview/types'
import type { Guide, Stream } from '.'
import * as Logo from './logo'

export type Type = {
  streamId: string
  channelId: string
  id: string
  name: string
  altNames: string[]
  isMain: boolean
  format: string
  languages: string[]
  timezones: string[]
  broadcastArea: string[]
  hasStreams?: boolean
  streamsCount?: number
  hasGuides?: boolean
  guidesCount?: number
  hasLogos?: boolean
  mainLogo?: Logo.Snippet
  pageUrl?: string
  addLogoUrl?: string
  addStreamUrl?: string
  requestLinkUrl?: string
  editUrl?: string
  removeUrl?: string
  fieldset?: HTMLPreviewField[]
  isBlocked?: boolean
  isClosed?: boolean
  guides?: Guide.Type[]
  streams?: Stream.Type[]
  logos?: Logo.Type[]
}
