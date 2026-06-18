import { orderBy, uniqBy } from 'es-toolkit'
import {
  BlocklistService,
  ChannelService,
  CountryService,
  FeedService,
  GuideService,
  LogoService,
  StreamService,
  type CategoryService,
  type LanguageService,
  type LocationService,
  type TimezoneService
} from './services'
import type {
  Channel,
  Timezone,
  Location,
  Stream,
  Guide,
  Feed,
  Country,
  Logo,
  Category,
  Language,
  BlocklistRecord
} from './types'

interface DataServices {
  channel: ChannelService
  country: CountryService
  stream: StreamService
  feed: FeedService
  logo: LogoService
  guide: GuideService
  language: LanguageService
  timezone: TimezoneService
  location: LocationService
  category: CategoryService
  blocklist: BlocklistService
}

export class DataManager {
  constructor(private services: DataServices) {}

  getCountries(): Country.Type[] {
    return this.services.country.getCountries().map(country => {
      const data = {
        streams: this.getCountryStreams(country)
      }

      return CountryService.getEnrichedCountry(country, data)
    })
  }

  getChannelStubs(): Channel.Stub[] {
    return this.services.channel.getChannels().map(channel =>
      ChannelService.getChannelStub(channel, {
        feeds: this.getChannelFeeds(channel),
        streams: this.getChannelStreams(channel),
        logos: this.getChannelLogos(channel),
        blocklistRecords: this.getChannelBlocklistRecords(channel),
        uniqueName: this.getChannelUniqueName(channel)
      })
    )
  }

  getChannels(): Channel.Type[] {
    return this.services.channel.getChannels().map(channel => {
      const data = {
        country: this.getChannelCountry(channel),
        locations: this.getChannelLocations(channel),
        timezones: this.getChannelTimezones(channel),
        languages: this.getChannelLanguages(channel),
        categories: this.getChannelCategories(channel),
        feeds: this.getChannelFeeds(channel),
        logos: this.getChannelLogos(channel),
        streams: this.getChannelStreams(channel),
        blocklistRecords: this.getChannelBlocklistRecords(channel),
        history: this.getChannelHistory(channel),
        guides: this.getChannelGuides(channel),
        uniqueName: this.getChannelUniqueName(channel)
      }

      return ChannelService.getEnrichedChannel(channel, data)
    })
  }

  getFeeds(): Feed.Type[] {
    return this.services.feed.getFeeds().map(feed => {
      const channel = this.services.channel.getChannel(feed.channelId)
      const blocklistRecords = this.getChannelBlocklistRecords(channel)
      const data = {
        streams: this.getFeedStreams(feed).map(stream => {
          return StreamService.getEnrichedStream(stream, {
            logos: this.getStreamLogos(stream),
            displayName: this.getStreamDisplayName(stream),
            categories: this.getStreamCategories(stream)
          })
        }),
        guides: this.getFeedGuides(feed).map(guide => {
          return GuideService.getEnrichedGuide(guide)
        }),
        logos: this.getFeedLogos(feed).map(logo => {
          return LogoService.getEnrichedLogo(logo, {
            displayName: this.getLogoDisplayName(logo),
            hasMainFeed: feed.isMain
          })
        }),
        fullName: this.getFeedFullName(feed),
        locations: this.getFeedLocations(feed),
        timezones: this.getFeedTimezones(feed),
        languages: this.getFeedLanguages(feed),
        isClosed: ChannelService.isClosed(channel),
        isBlocked: !!blocklistRecords.length
      }

      return FeedService.getEnrichedFeed(feed, data)
    })
  }

  getGuides(): Guide.Type[] {
    return this.services.guide.getGuides().map(guide => {
      return GuideService.getEnrichedGuide(guide)
    })
  }

  getLogos(): Logo.Type[] {
    return this.services.logo.getLogos().map(logo => {
      const feed = this.getLogoFeed(logo)

      const data = {
        displayName: this.getLogoDisplayName(logo),
        hasMainFeed: feed?.isMain ?? false
      }

      return LogoService.getEnrichedLogo(logo, data)
    })
  }

  getStreams(): Stream.Type[] {
    return this.services.stream.getStreams().map(stream => {
      const data = {
        displayName: this.getStreamDisplayName(stream),
        categories: this.getStreamCategories(stream),
        logos: this.getStreamLogos(stream)
      }

      return StreamService.getEnrichedStream(stream, data)
    })
  }

  getSearchable(): Channel.Searchable[] {
    return this.services.channel.getChannels().map(channel => {
      const data = {
        languages: this.getChannelLanguages(channel),
        timezones: this.getChannelTimezones(channel),
        streams: this.getChannelStreams(channel),
        feeds: this.getChannelFeeds(channel),
        logos: this.getChannelLogos(channel),
        guides: this.getChannelGuides(channel),
        locations: this.getChannelLocations(channel),
        blocklistRecords: this.getChannelBlocklistRecords(channel),
        country: this.getChannelCountry(channel)
      }

      return ChannelService.getSearchable(channel, data)
    })
  }

  getStreamCategories(stream: Stream.Type): Category.Type[] {
    const channel = this.getStreamChannel(stream)
    if (!channel) return []

    return this.getChannelCategories(channel)
  }

  getChannelFeeds(channel: Channel.Type): Feed.Type[] {
    const feeds = this.services.feed.getFeedsByChannelId(channel.id)

    return orderBy(feeds, [feed => (feed.isMain ? 1 : 0), feed => feed.id], ['desc', 'asc'])
  }

  getChannelGuides(channel: Channel.Type): Guide.Type[] {
    return this.services.guide.getGuidesByChannelId(channel.id)
  }

  getCountryStreams(country: Country.Type): Stream.Type[] {
    return this.services.stream.getStreamsByCountryCode(country.code)
  }

  getChannelStreams(channel: Channel.Type): Stream.Type[] {
    return this.services.stream.getStreamsByChannelId(channel.id)
  }

  getStreamChannel(stream: Stream.Type): Channel.Type | undefined {
    return this.services.channel.getChannel(stream.channelId)
  }

  getStreamFeed(stream: Stream.Type): Feed.Type | undefined {
    return this.services.feed.getFeed(
      StreamService.getId({ channelId: stream.channelId, feedId: stream.feedId })
    )
  }

  getStreamDisplayName(stream: Stream.Type): string {
    const channel = this.getStreamChannel(stream)
    if (!channel) return ''

    const feed = this.getStreamFeed(stream)
    if (!feed) return channel.name

    return `${this.getChannelUniqueName(channel)} ${feed.name}`
  }

  getFeedStreams(feed: Feed.Type): Stream.Type[] {
    const streamId = StreamService.getId({ channelId: feed.channelId, feedId: feed.id })

    return this.services.stream.getStreamsById(streamId)
  }

  getFeedGuides(feed: Feed.Type): Guide.Type[] {
    const streamId = StreamService.getId({ channelId: feed.channelId, feedId: feed.id })

    return this.services.guide.getGuidesByStreamId(streamId)
  }

  getFeedLogos(feed: Feed.Type): Logo.Type[] {
    const streamId = StreamService.getId({ channelId: feed.channelId, feedId: feed.id })

    return this.services.logo.getLogosByStreamId(streamId)
  }

  getChannelCountry(channel: Channel.Type): Country.Type | undefined {
    return this.services.country.getCountry(channel.countryCode)
  }

  getLogoFeed(logo: Logo.Type): Feed.Type | undefined {
    return this.services.feed.getFeed(StreamService.getId(logo))
  }

  getLogoChannel(logo: Logo.Type): Channel.Type | undefined {
    return this.services.channel.getChannel(logo.channelId)
  }

  getChannelLogos(channel: Channel.Type): Logo.Type[] {
    return this.services.logo.getLogosByChannelId(channel.id)
  }

  getLogoDisplayName(logo: Logo.Type): string {
    const feed = this.getLogoFeed(logo)
    if (feed) return this.getFeedFullName(feed)

    const channel = this.getLogoChannel(logo)
    if (channel) return this.getChannelUniqueName(channel)

    return ''
  }

  getChannelBlocklistRecords(channel: Channel.Type): BlocklistRecord.Type[] {
    const records = this.services.blocklist.getRecordsByChannelId(channel.id)
    if (!records) return []

    return records.map(record => {
      return BlocklistService.getEnrichedRecord(record)
    })
  }

  getFeedFullName(feed: Feed.Type): string {
    const channel = this.services.channel.getChannel(feed.channelId)
    if (!channel) return ''

    const uniqueName = this.getChannelUniqueName(channel)

    return `${uniqueName} ${feed.name}`
  }

  getFeedChannelLogosPath(feed: Feed.Type): string {
    const channel = this.services.channel.getChannel(feed.channelId)

    return ChannelService.getLogosPath(channel.id)
  }

  getChannelUniqueName(channel: Channel.Type): string {
    if (!channel) return ''
    if (channel.hasUniqueName) return channel.name

    const country = this.services.country.getCountry(channel.countryCode)
    if (!country) return channel.name

    return `${channel.name} (${country.name})`
  }

  getChannelLocations(channel: Channel.Type): Location.Type[] {
    const feeds = this.getChannelFeeds(channel)

    let locations = []
    feeds.forEach(feed => {
      locations = locations.concat(this.getFeedLocations(feed))
    })

    return uniqBy(locations, l => l.code)
  }

  getFeedLanguages(feed: Feed.Type): Language.Type[] {
    const languages = []

    feed.languages.forEach(code => {
      const language = this.services.language.getLanguage(code)
      if (language) languages.push(language)
    })

    return languages
  }

  getFeedLocations(feed: Feed.Type): Location.Type[] {
    return feed.broadcastArea.map(code => this.services.location.getLocation(code))
  }

  getFeedTimezones(feed: Feed.Type): Timezone.Type[] {
    return feed.timezones.map(code => this.services.timezone.getTimezone(code))
  }

  getChannelLanguges(channel: Channel.Type): Language.Type[] {
    const feeds = this.getChannelFeeds(channel)

    let languages = []
    feeds.forEach(feed => {
      languages = languages.concat(this.getFeedLanguages(feed))
    })

    return uniqBy(languages, l => l.code)
  }

  getChannelTimezones(channel: Channel.Type): Timezone.Type[] {
    const feeds = this.getChannelFeeds(channel)

    let timezones = []
    feeds.forEach(feed => {
      timezones = timezones.concat(this.getFeedTimezones(feed))
    })

    return uniqBy(timezones, t => t.id)
  }

  getChannelHistory(channel: Channel.Type): (Channel.HistoryGroup | Channel.HistoryItem)[] {
    const targetId = channel.id
    const { edgesTo, edgesFrom } = this.services.channel.getHistoryGraph()

    const successors: string[] = []
    const visited = new Set<string>([targetId])
    let current = targetId

    while (edgesFrom.has(current)) {
      const nextId = edgesFrom.get(current)!
      if (visited.has(nextId)) break
      visited.add(nextId)
      successors.push(nextId)
      current = nextId
    }

    const ancestors: (string | string[])[] = []
    let ancestorCurrent = targetId

    while (true) {
      const parents = edgesTo.get(ancestorCurrent)
      if (!parents || parents.length === 0) break

      if (parents.length > 1) {
        ancestors.unshift(parents)
        break
      }

      const parentId = parents[0]
      if (visited.has(parentId)) break

      visited.add(parentId)
      ancestors.unshift(parentId)
      ancestorCurrent = parentId
    }

    const history = ancestors.concat(targetId, successors)

    if (history.length <= 1) return []

    return history.map(item => {
      if (Array.isArray(item)) {
        const channels = item.map(id => {
          const channel = this.services.channel.getChannel(id)
          if (!channel) return null

          return ChannelService.getHistoryItem(channel, {
            uniqueName: this.getChannelUniqueName(channel),
            logos: this.getChannelLogos(channel)
          })
        })

        return ChannelService.getHistoryGroup(channels)
      }

      const channel = this.services.channel.getChannel(item)
      if (!channel) return null

      return ChannelService.getHistoryItem(channel, {
        uniqueName: this.getChannelUniqueName(channel),
        logos: this.getChannelLogos(channel)
      })
    })
  }

  getChannelFeed(channel: Channel.Type, feedId: string): Feed.Type | undefined {
    return this.services.feed.getFeed(StreamService.getId({ channelId: channel.id, feedId }))
  }

  getChannelCategories(channel: Channel.Type): Category.Type[] {
    if (!channel) return []
    return channel.categories
      .sort()
      .map(id => this.services.category.getCategory(id))
      .filter(Boolean)
  }

  getChannelLanguages(channel: Channel.Type): Language.Type[] {
    let languages = []

    this.getChannelFeeds(channel).forEach(feed => {
      languages = languages.concat(this.getFeedLanguages(feed))
    })

    return uniqBy(languages, l => l.code).filter(Boolean)
  }

  getStreamLogos(stream: Stream.Type): Logo.Type[] {
    function byFormat(logo: Logo.Type): number {
      const levelByFormat = { SVG: 0, PNG: 3, APNG: 1, WebP: 1, AVIF: 1, JPEG: 2, GIF: 1 }

      return levelByFormat[logo.format] || 0
    }

    const channel = this.getStreamChannel(stream)
    if (!channel) return []

    const logos = this.getChannelLogos(channel)
    if (!logos.length) return []

    return orderBy(logos, [byFormat], ['desc'])
  }
}
