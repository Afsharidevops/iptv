import type { HTMLPreviewField } from '$lib/components/HTMLPreview/types'
import { StreamService } from './streamService'
import { normalize, getYear } from '$lib/utils'
import { SITE_ORIGIN } from '$lib/constants'
import { orderBy } from 'natural-orderby'
import * as sdk from '@iptv-org/sdk'
import { uniq } from 'es-toolkit'
import dayjs from 'dayjs'
import type {
  BlocklistRecord,
  Category,
  Channel,
  Country,
  Feed,
  Guide,
  Language,
  Location,
  Logo,
  Stream,
  Timezone
} from '$lib/types'

export class ChannelService {
  channels = new Map<string, Channel.Type>()
  channelsGroupedByCountryCode = new Map<string, Channel.Type[]>()
  historyGraph: Channel.HistoryGraph

  constructor(rawChannels: sdk.Types.ChannelData[]) {
    const nameCount = new Map<string, number>()

    const unsortedChannels: Channel.Type[] = rawChannels.map(data => {
      const count = nameCount.get(data.name) || 0
      nameCount.set(data.name, count + 1)

      return {
        id: data.id,
        name: data.name,
        altNames: data.alt_names || [],
        countryCode: data.country,
        network: data.network || null,
        owners: data.owners || [],
        categories: data.categories || [],
        isNsfw: data.is_nsfw || false,
        launched: data.launched || null,
        closed: data.closed || null,
        replacedBy: data.replaced_by || null,
        website: data.website || null,
        dataPath: ChannelService.getDataPath(data.id),
        logosPath: ChannelService.getLogosPath(data.id),
        feedsPath: ChannelService.getFeedsPath(data.id),
        hasUniqueName: false
      }
    })

    const sortedChannels = orderBy(unsortedChannels, [c => c.name], ['asc'])

    for (const channel of sortedChannels) {
      if (nameCount.get(channel.name) === 1) channel.hasUniqueName = true

      this.channels.set(channel.id, channel)
    }

    function buildGraph(channels: Channel.Type[]) {
      const graph = {
        edgesTo: new Map<string, string[]>(),
        edgesFrom: new Map<string, string>()
      }

      for (const channel of channels) {
        if (!channel.replacedBy) continue
        const target = channel.replacedBy.split('@')[0]
        if (target === channel.id) continue
        graph.edgesFrom.set(channel.id, target)
        const toList = graph.edgesTo.get(target)
        if (toList) {
          toList.push(channel.id)
        } else {
          graph.edgesTo.set(target, [channel.id])
        }
      }

      return graph
    }

    this.channelsGroupedByCountryCode = Map.groupBy(sortedChannels, channel => channel.countryCode)
    this.historyGraph = buildGraph(sortedChannels)
  }

  getHistoryGraph(): Channel.HistoryGraph {
    return this.historyGraph
  }

  getChannel(id: string): Channel.Type | undefined {
    return this.channels.get(id)
  }

  getChannels(): Channel.Type[] {
    return Array.from(this.channels.values())
  }

  getChannelsByCountryCode(countryCode: string): Channel.Type[] {
    return this.channelsGroupedByCountryCode.get(countryCode) || []
  }

  static getPagePath(channelId: string): string {
    const [slug, country] = channelId.split('.')

    return `/channels/${country}/${slug}`
  }

  static getPageUrl(channelId: string): string {
    const path = ChannelService.getPagePath(channelId)

    return new URL(path.replace(/^\//, ''), SITE_ORIGIN).toString()
  }

  static isClosed(data: { closed: string | null; replacedBy: string | null }): boolean {
    return !!data.closed || !!data.replacedBy
  }

  static getAddFeedUrl(data: { channelId: string; uniqueName: string }): string {
    const endpoint = 'https://github.com/iptv-org/database/issues/new'
    const params = new URLSearchParams({
      labels: 'feeds:add',
      template: '04_feeds_add.yml',
      title: `Add: ${data.uniqueName} Feed`,
      channel_id: data.channelId
    })

    return `${endpoint}?${params.toString()}`
  }

  static getRequestLinkUrl(data: { channelId: string; uniqueName: string }): string {
    const endpoint = 'https://github.com/iptv-org/iptv/discussions/new'
    const params = new URLSearchParams({
      category: 'channel-search',
      title: data.uniqueName,
      stream_id: data.channelId
    })

    return `${endpoint}?${params.toString()}`
  }

  static getEditUrl(data: { channelId: string; uniqueName: string }): string {
    const endpoint = 'https://github.com/iptv-org/database/issues/new'
    const params = new URLSearchParams({
      labels: 'channels:edit',
      template: '02_channels_edit.yml',
      title: `Edit: ${data.uniqueName}`,
      id: data.channelId
    })

    return `${endpoint}?${params.toString()}`
  }

  static getRemoveUrl(data: { channelId: string; uniqueName: string }): string {
    const endpoint = 'https://github.com/iptv-org/database/issues/new'
    const params = new URLSearchParams({
      labels: 'channels:remove',
      template: '03_channels_remove.yml',
      title: `Remove: ${data.uniqueName}`,
      id: data.channelId
    })

    return `${endpoint}?${params.toString()}`
  }

  static getAddLogoUrl(data: { uniqueName: string; channelId: string }): string {
    const endpoint = 'https://github.com/iptv-org/database/issues/new'
    const params = new URLSearchParams({
      labels: 'logos:add',
      template: '07_logos_add.yml',
      title: `Add: ${data.uniqueName} Logo`,
      channel_id: data.channelId
    })

    return `${endpoint}?${params.toString()}`
  }

  static getEnrichedChannel(
    channel: Channel.Type,
    data: {
      country: Country.Type
      locations: Location.Type[]
      timezones: Timezone.Type[]
      languages: Language.Type[]
      categories: Category.Type[]
      feeds: Feed.Type[]
      logos: Logo.Type[]
      streams: Stream.Type[]
      guides: Guide.Type[]
      blocklistRecords: BlocklistRecord.Type[]
      history: (Channel.HistoryGroup | Channel.HistoryItem)[]
      uniqueName: string
    }
  ): Channel.Type {
    const { blocklistRecords, logos, feeds, streams, history, categories, guides, uniqueName } =
      data
    const mainLogo = logos[0]

    return {
      ...channel,
      mainLogo: mainLogo
        ? {
            width: mainLogo.width,
            height: mainLogo.height,
            url: mainLogo.url,
            displayName: uniqueName
          }
        : null,
      hasStreams: !!streams.length,
      hasLogos: !!logos.length,
      hasFeeds: !!feeds.length,
      hasGuides: !!guides.length,
      isBlocked: !!blocklistRecords.length,
      hasBlocklistRecords: !!blocklistRecords.length,
      blocklistRecords,
      isClosed: ChannelService.isClosed(channel),
      pageUrl: ChannelService.getPageUrl(channel.id),
      pagePath: ChannelService.getPagePath(channel.id),
      uniqueName,
      addLogoUrl: ChannelService.getAddLogoUrl({ uniqueName, channelId: channel.id }),
      addFeedUrl: ChannelService.getAddFeedUrl({ uniqueName, channelId: channel.id }),
      editUrl: ChannelService.getEditUrl({ uniqueName, channelId: channel.id }),
      removeUrl: ChannelService.getRemoveUrl({ uniqueName, channelId: channel.id }),
      requestLinkUrl: ChannelService.getRequestLinkUrl({ uniqueName, channelId: channel.id }),
      hasHistory: !!history.length,
      history,
      structuredData: ChannelService.getStructuredData(channel, { categories, mainLogo }),
      fieldset: ChannelService.getFieldset(channel, data),
      streams: streams.map(stream => ({
        channelId: stream.channelId,
        hash: stream.hash
      }))
    }
  }

  static getStructuredData(
    channel: Channel.Type,
    data: { categories: Category.Type[]; mainLogo: Logo.Type }
  ): Channel.StructuredData {
    const { id, name, altNames, website } = channel
    const { categories, mainLogo } = data

    return {
      '@context': 'https://schema.org/',
      '@type': 'TelevisionChannel',
      image: mainLogo?.url ?? '',
      identifier: id,
      name: name,
      alternateName: altNames.map((name: string) => ({ '@value': name })),
      genre: categories.map(c => ({ '@value': c.name })),
      sameAs: website
    }
  }

  static getChannelStub(
    channel: Channel.Type,
    data: {
      feeds: Feed.Type[]
      streams: Stream.Type[]
      blocklistRecords: BlocklistRecord.Type[]
      logos: Logo.Type[]
      uniqueName: string
    }
  ): Channel.Stub {
    const { id, name, altNames, closed, replacedBy, countryCode } = channel
    const { feeds, streams, blocklistRecords, logos, uniqueName } = data
    const mainLogo = logos[0]

    return {
      id,
      name,
      uniqueName,
      altNames,
      hasAltNames: !!altNames.length,
      countryCode,
      mainLogoUrl: mainLogo?.url ?? '',
      feedsCount: feeds.length,
      closed,
      pagePath: ChannelService.getPagePath(id),
      isClosed: ChannelService.isClosed({ closed, replacedBy }),
      isBlocked: !!blocklistRecords.length,
      blocklistRecords,
      streams: streams.map(stream => ({
        channelId: stream.channelId,
        hash: stream.hash
      })),
      addLogoUrl: ChannelService.getAddLogoUrl({ uniqueName, channelId: id }),
      addFeedUrl: ChannelService.getAddFeedUrl({ uniqueName, channelId: id }),
      logosPath: ChannelService.getLogosPath(id),
      feedsPath: ChannelService.getFeedsPath(id),
      dataPath: ChannelService.getDataPath(id)
    }
  }

  static getHistoryGroup(items: Channel.HistoryItem[]): Channel.HistoryGroup {
    return {
      type: 'group',
      key: items.map(i => i.key).join('_'),
      items: items
    }
  }

  static getHistoryItem(
    channel: Channel.Type,
    data: { uniqueName: string; logos: Logo.Type[] }
  ): Channel.HistoryItem {
    const { id, name, launched, closed } = channel
    const { uniqueName, logos } = data
    const mainLogo = logos[0]

    return {
      type: 'channel',
      key: id,
      channel: {
        id,
        name,
        uniqueName,
        mainLogoUrl: mainLogo?.url,
        pagePath: ChannelService.getPagePath(id),
        launchedYear: getYear(launched),
        closedYear: getYear(closed)
      }
    }
  }

  static getFieldset(
    channel: Channel.Type,
    data: {
      country: Country.Type
      locations: Location.Type[]
      timezones: Timezone.Type[]
      languages: Language.Type[]
      categories: Category.Type[]
      feeds: Feed.Type[]
    }
  ): HTMLPreviewField[] {
    function toString(val: string | string[] | null) {
      if (val != null && (!Array.isArray(val) || val.length))
        return { text: val.toString(), title: val.toString() }
      return null
    }

    function toDate(val: string) {
      return val ? { text: dayjs(val).format('D MMMM YYYY'), title: val } : null
    }

    function toLink(label: string, query: string) {
      return label ? { label, query } : null
    }

    function toExternalLink(val: string) {
      return val ? { href: val, title: val, label: val } : null
    }

    const { id, name, altNames, network, owners, isNsfw, launched, closed, replacedBy, website } =
      channel
    const { country, locations, timezones, languages, categories, feeds } = data

    const videoFormats = []
    feeds.forEach(feed => {
      videoFormats.push(feed.format)
    })

    return [
      { name: 'id', type: 'string', value: toString(id) },
      { name: 'name', type: 'string', value: toString(name) },
      { name: 'alt_names', type: 'string[]', value: altNames.map(toString) },
      {
        name: 'network',
        type: 'link',
        value: toLink(network, `network:${normalize(network)}`)
      },
      {
        name: 'owners',
        type: 'link[]',
        value: owners.map((name: string) => toLink(name, `owner:${normalize(name)}`))
      },
      {
        name: 'country',
        type: 'link',
        value: toLink(country?.name, `country:${country?.code}`)
      },
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
        name: 'categories',
        type: 'link[]',
        value: categories.map(category => toLink(category.name, `category:${category.id}`))
      },
      {
        name: 'is_nsfw',
        type: 'link',
        value: toLink(isNsfw.toString(), `is_nsfw:${isNsfw}`)
      },
      {
        name: 'formats',
        type: 'link[]',
        value: uniq(videoFormats).map((format: string) => toLink(format, `format:${format}`))
      },
      {
        name: 'launched',
        type: 'string',
        value: toDate(launched)
      },
      {
        name: 'closed',
        type: 'string',
        value: toDate(closed)
      },
      {
        name: 'replaced_by',
        type: 'link',
        value: toLink(replacedBy, replacedBy)
      },
      {
        name: 'website',
        type: 'external_link',
        value: toExternalLink(website)
      }
    ].filter((field: HTMLPreviewField) =>
      Array.isArray(field.value) ? field.value.length : field.value
    )
  }

  static getSearchable(
    channel: Channel.Type,
    data: {
      languages: Language.Type[]
      timezones: Timezone.Type[]
      streams: Stream.Type[]
      feeds: Feed.Type[]
      logos: Logo.Type[]
      guides: Guide.Type[]
      locations: Location.Type[]
      blocklistRecords: BlocklistRecord.Type[]
      country: Country.Type
    }
  ): Channel.Searchable {
    const {
      languages,
      timezones,
      streams,
      feeds,
      logos,
      guides,
      locations,
      blocklistRecords,
      country
    } = data
    const {
      id,
      name,
      altNames,
      launched,
      closed,
      replacedBy,
      website,
      owners,
      network,
      countryCode,
      categories,
      isNsfw
    } = channel

    const languageCodes = languages.map(language => language.code)
    const languageNames = languages.map(language => language.name)
    const timezoneIds = timezones.map(timezone => timezone.id)
    const streamUrls = streams.map(stream => stream.url)
    const streamTitles = streams.map(stream => stream.title)
    const streamsCount = streams.length
    const feedsCount = feeds.length
    const feedNames = feeds.map(feed => feed.name)
    const streamIds = feeds.map(feed =>
      StreamService.getId({ channelId: feed.channelId, feedId: feed.id })
    )
    const logoUrls = logos.map(logo => logo.url)
    const logosCount = logos.length
    const guideSiteNames = uniq(guides.map(guide => guide.siteName))
    const guideSites = uniq(guides.map(guide => guide.site))
    const guidesCount = guides.length
    const broadcastAreaCodes = locations.map(location => location.code)
    const broadcastAreaNames = locations.map(location => location.name)

    let videoFormats = []
    let feedAltNames = []
    feeds.forEach(feed => {
      videoFormats.push(feed.format)
      feedAltNames = feedAltNames.concat(feed.altNames)
    })
    videoFormats = uniq(videoFormats)
    feedAltNames = uniq(feedAltNames)

    return {
      id,
      name,
      alt_names: altNames,
      alt_name: altNames,
      network: network || '',
      owners,
      owner: owners,
      country: countryCode,
      category: categories,
      categories: categories,
      launched: launched || '',
      closed: closed || '',
      replaced_by: replacedBy || '',
      website: website || '',
      is_nsfw: isNsfw,
      is_closed: ChannelService.isClosed({ closed, replacedBy }),
      is_blocked: !!blocklistRecords.length,
      feeds: feedsCount,
      logos: logosCount,
      streams: streamsCount,
      guides: guidesCount,
      language: languageCodes,
      languages: languageCodes,
      format: videoFormats,
      formats: videoFormats,
      timezone: timezoneIds,
      timezones: timezoneIds,
      broadcast_area: broadcastAreaCodes,
      _languageNames: languageNames,
      _countryName: country.name,
      _guideSites: guideSites,
      _guideSiteNames: guideSiteNames,
      _streamTitles: streamTitles,
      _streamUrls: streamUrls,
      _streamIds: streamIds,
      _feedNames: feedNames,
      _feedAltNames: feedAltNames,
      _logoUrls: logoUrls,
      _broadcastAreaNames: broadcastAreaNames
    }
  }

  static getDataDir(channelId: string): string {
    const [slug, countryCode] = channelId.split('.')

    return `/data/channels/${countryCode}/${slug}`
  }

  static getDataPath(channelId: string): string {
    const dir = ChannelService.getDataDir(channelId)

    return `${dir}/_data.msgpack`
  }

  static getLogosPath(channelId: string): string {
    const dir = ChannelService.getDataDir(channelId)

    return `${dir}/logos.msgpack`
  }

  static getFeedsPath(channelId: string): string {
    const dir = ChannelService.getDataDir(channelId)

    return `${dir}/feeds.msgpack`
  }
}
