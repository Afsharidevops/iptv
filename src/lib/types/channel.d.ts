import type { HTMLPreviewField } from '$lib/components/HTMLPreview/types'
import * as BlocklistRecord from './blocklistRecord'
import type { Stream } from '.'
import * as Logo from './logo'

export type Type = {
  id: string
  name: string
  altNames: string[]
  network: string
  owners: string[]
  countryCode: string
  categories: string[]
  isNsfw: boolean
  launched: string
  closed: string
  replacedBy: string
  website: string
  dataPath: string
  logosPath: string
  feedsPath: string
  hasUniqueName: boolean
  mainLogo?: Logo.Snippet
  structuredData?: StructuredData
  isBlocked?: boolean
  isClosed?: boolean
  pageUrl?: string
  pagePath?: string
  uniqueName?: string
  addLogoUrl?: string
  addFeedUrl?: string
  editUrl?: string
  removeUrl?: string
  requestLinkUrl?: string
  blocklistRecords?: BlocklistRecord.Type[]
  hasBlocklistRecords?: boolean
  hasGuides?: boolean
  hasLogos?: boolean
  hasFeeds?: boolean
  hasStreams?: boolean
  hasHistory?: boolean
  history?: (HistoryGroup | HistoryItem)[]
  fieldset?: HTMLPreviewField[]
  streams?: Stream.Snippet[]
}

export type Stub = {
  id: string
  name: string
  altNames: string[]
  hasAltNames: boolean
  countryCode: string
  mainLogoUrl: string
  feedsCount: number
  closed: string
  pagePath: string
  isClosed: boolean
  isBlocked: boolean
  blocklistRecords: BlocklistRecord.Type[]
  streams: Stream.Snippet[]
  logosPath: string
  feedsPath: string
  addLogoUrl: string
  addFeedUrl: string
  uniqueName: string
  dataPath: string
}

export type HistoryGraph = {
  edgesTo: Map<string, string[]>
  edgesFrom: Map<string, string>
}

export type HistoryGroup = {
  key: string
  type: string
  items: HistoryItem[]
}

export type HistoryItem = {
  key: string
  type: string
  channel: Snippet
}

export type Snippet = {
  id: string
  name: string
  pagePath: string
  uniqueName: string
  mainLogoUrl: string
  launchedYear: string
  closedYear: string
}

export type Searchable = {
  id: string
  name: string
  alt_names: string[]
  alt_name: string[]
  network: string
  owner: string[]
  owners: string[]
  country: string
  category: string[]
  categories: string[]
  launched: string
  closed: string
  replaced_by: string
  website: string
  is_nsfw: boolean
  is_closed: boolean
  is_blocked: boolean
  languages: string[]
  language: string[]
  broadcast_area: string[]
  streams: number
  guides: number
  feeds: number
  logos: number
  format: string[]
  formats: string[]
  timezone: string[]
  timezones: string[]
  _languageNames: string[]
  _broadcastAreaNames: string[]
  _countryName: string
  _guideSites: string[]
  _guideSiteNames: string[]
  _streamTitles: string[]
  _streamUrls: string[]
  _feedNames: string[]
  _feedAltNames: string[]
  _streamIds: string[]
  _logoUrls: string[]
}

export type StructuredData = {
  '@context': string
  '@type': string
  image: string
  identifier: string
  name: string
  alternateName: { '@value': string }[]
  genre: { '@value': string }[]
  sameAs: string
}
