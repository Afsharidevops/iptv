import type { Language, Logo, Timezone, Location, Stream, Guide, Feed } from '$lib/types'
import type { HTMLPreviewField } from '$lib/components/HTMLPreview/types'
import { StreamService } from './streamService'
import { SITE_ORIGIN } from '$lib/constants'
import { orderBy } from 'natural-orderby'
import * as sdk from '@iptv-org/sdk'

export class FeedService {
  feeds = new Map<string, Feed.Type>()
  feedsGroupedByChannelId = new Map<string, Feed.Type[]>()

  constructor(rawFeeds: sdk.Types.FeedData[]) {
    const unsortedFeeds: Feed.Type[] = rawFeeds.map(data => {
      const streamId = StreamService.getId({ channelId: data.channel, feedId: data.id })

      return {
        id: data.id,
        channelId: data.channel,
        streamId,
        name: data.name,
        altNames: data.alt_names || [],
        isMain: data.is_main || false,
        format: data.format,
        languages: data.languages || [],
        timezones: data.timezones || [],
        broadcastArea: data.broadcast_area || []
      }
    })

    const sortedFeeds = orderBy(unsortedFeeds, [f => f.isMain, f => f.name], ['desc', 'asc'])

    for (const feed of sortedFeeds) {
      this.feeds.set(feed.streamId, feed)
    }

    this.feedsGroupedByChannelId = Map.groupBy(sortedFeeds, feed => feed.channelId)
  }

  getFeeds(): Feed.Type[] {
    return Array.from(this.feeds.values())
  }

  getFeed(id: string): Feed.Type | undefined {
    return this.feeds.get(id)
  }

  getFeedsByChannelId(channelId: string): Feed.Type[] {
    return this.feedsGroupedByChannelId.get(channelId) || []
  }

  static getAddStreamUrl(data: { fullName: string; streamId: string }): string {
    const endpoint = 'https://github.com/iptv-org/iptv/issues/new'
    const params = new URLSearchParams({
      labels: 'streams:add',
      template: '1_streams_add.yml',
      title: `Add: ${data.fullName}`,
      stream_id: data.streamId
    })

    return `${endpoint}?${params.toString()}`
  }

  static getAddLogoUrl(data: { fullName: string; channelId: string; feedId: string }): string {
    const endpoint = 'https://github.com/iptv-org/database/issues/new'
    const params = new URLSearchParams({
      labels: 'logos:add',
      template: '07_logos_add.yml',
      title: `Add: ${data.fullName} Logo`,
      channel_id: data.channelId,
      feed_id: data.feedId
    })

    return `${endpoint}?${params}`
  }

  static getRequestLinkUrl(data: { fullName: string; streamId: string }): string {
    const endpoint = 'https://github.com/iptv-org/iptv/discussions/new'
    const params = new URLSearchParams({
      category: 'channel-search',
      title: data.fullName,
      stream_id: data.streamId
    })

    return `${endpoint}?${params.toString()}`
  }

  static getEditUrl(data: { fullName: string; channelId: string; feedId: string }): string {
    const endpoint = 'https://github.com/iptv-org/database/issues/new'
    const params = new URLSearchParams({
      labels: 'feeds:edit',
      template: '05_feeds_edit.yml',
      title: `Edit: ${data.fullName}`,
      feed_id: data.feedId,
      channel_id: data.channelId
    })

    return `${endpoint}?${params.toString()}`
  }

  static getRemoveUrl(data: { fullName: string; channelId: string; feedId: string }): string {
    const endpoint = 'https://github.com/iptv-org/database/issues/new'
    const params = new URLSearchParams({
      labels: 'feeds:remove',
      template: '06_feeds_remove.yml',
      title: `Remove: ${data.fullName}`,
      feed_id: data.feedId,
      channel_id: data.channelId
    })

    return `${endpoint}?${params.toString()}`
  }

  static getPagePath(data: { channelId: string; feedId: string }): string {
    const [slug, country] = data.channelId.split('.')

    return `/channels/${country}/${slug}#${data.feedId}`
  }

  static getPageUrl(data: { channelId: string; feedId: string }): string {
    const path = FeedService.getPagePath(data)

    return new URL(path, SITE_ORIGIN).toString()
  }

  static getEnrichedFeed(
    feed: Feed.Type,
    data: {
      fullName: string
      streams: Stream.Type[]
      guides: Guide.Type[]
      logos: Logo.Type[]
      locations: Location.Type[]
      timezones: Timezone.Type[]
      languages: Language.Type[]
    }
  ): Feed.Type {
    const { streams, guides, logos, fullName, locations, timezones, languages } = data
    const { channelId, id: feedId } = feed

    const streamId = StreamService.getId({ channelId, feedId })
    const mainLogo = logos[0]

    return {
      ...feed,
      hasStreams: !!streams.length,
      streamsCount: streams.length,
      streams,
      hasGuides: !!guides.length,
      guidesCount: guides.length,
      guides,
      hasLogos: !!logos.length,
      mainLogo: mainLogo
        ? {
            width: mainLogo.width,
            height: mainLogo.height,
            url: mainLogo.url,
            displayName: fullName
          }
        : null,
      logos,
      addLogoUrl: FeedService.getAddLogoUrl({ fullName, channelId, feedId }),
      addStreamUrl: FeedService.getAddStreamUrl({ fullName, streamId }),
      requestLinkUrl: FeedService.getRequestLinkUrl({ fullName, streamId }),
      editUrl: FeedService.getEditUrl({ fullName, channelId, feedId }),
      removeUrl: FeedService.getRemoveUrl({ fullName, channelId, feedId }),
      pageUrl: FeedService.getPageUrl({ channelId, feedId }),
      fieldset: FeedService.getFieldset(feed, {
        locations,
        timezones,
        languages
      })
    }
  }

  static getFieldset(
    feed: Feed.Type,
    data: { locations: Location.Type[]; timezones: Timezone.Type[]; languages: Language.Type[] }
  ): HTMLPreviewField[] {
    const { id, name, altNames, isMain, format } = feed
    const { locations, timezones, languages } = data

    function toString(val: string | string[] | null) {
      if (val != null && (!Array.isArray(val) || val.length))
        return { text: val.toString(), title: val.toString() }
      return null
    }

    function toLink(label: string, query: string) {
      return label ? { label, query } : null
    }

    return [
      { name: 'id', type: 'string', value: toString(id) },
      { name: 'name', type: 'string', value: toString(name) },
      { name: 'alt_names', type: 'string[]', value: altNames.map(toString) },
      { name: 'is_main', type: 'string', value: toString(isMain.toString()) },
      {
        name: 'broadcast_area',
        type: 'link[]',
        value: locations.map(location => toLink(location.name, `broadcast_area:${location.code}`))
      },
      {
        name: 'timezones',
        type: 'link[]',
        value: timezones.map(timezone => toLink(timezone.id, `timezone:${timezone.id}`))
      },
      {
        name: 'languages',
        type: 'link[]',
        value: languages.map(language => toLink(language.name, `language:${language.code}`))
      },
      {
        name: 'format',
        type: 'link',
        value: toLink(format, `format:${format}`)
      }
    ].filter((field: HTMLPreviewField) =>
      Array.isArray(field.value) ? field.value.length : field.value
    )
  }
}
