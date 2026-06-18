import { Storage } from '@freearhey/storage-js'
import { DataManager } from '$lib/dataManager'
import { STATIC_DIR } from '$lib/constants'
import type { Compile } from '$lib/types'
import * as sdk from '@iptv-org/sdk'
import { fileURLToPath } from 'url'
import { Packr } from 'msgpackr'
import * as api from '$lib/api'
import pLimit from 'p-limit'
import {
  BlocklistService,
  CategoryService,
  ChannelService,
  CountryService,
  FeedService,
  GuideService,
  LanguageService,
  LocationService,
  LogoService,
  StreamService,
  TimezoneService
} from '$lib/services'

export default async function main() {
  console.log('loading api data...')
  const rawData = await load()
  console.log('compiling...')
  const compiled = compile(rawData)
  console.log('saving...')
  await save(compiled)
}

export async function load(): Promise<sdk.Types.RawData> {
  return await api.loadDataFromDisk()
}

export function compile(data: sdk.Types.RawData): Compile.Data {
  const locations = []
  data.cities.forEach(city => {
    locations.push({ code: `ct/${city.code}`, name: city.name })
  })
  data.regions.forEach(region => {
    locations.push({ code: `r/${region.code}`, name: region.name })
  })
  data.subdivisions.forEach(subdivision => {
    locations.push({ code: `s/${subdivision.code}`, name: subdivision.name })
  })
  data.countries.forEach(country => {
    locations.push({ code: `c/${country.code}`, name: country.name })
  })

  const services = {
    logo: new LogoService(data.logos),
    feed: new FeedService(data.feeds),
    guide: new GuideService(data.guides),
    stream: new StreamService(data.streams),
    channel: new ChannelService(data.channels),
    country: new CountryService(data.countries),
    language: new LanguageService(data.languages),
    location: new LocationService(locations),
    timezone: new TimezoneService(data.timezones),
    category: new CategoryService(data.categories),
    blocklist: new BlocklistService(data.blocklist)
  }

  const dataManager = new DataManager(services)

  const output = {
    searchable: dataManager.getSearchable(),
    countries: dataManager.getCountries(),
    channelStubs: dataManager.getChannelStubs(),
    channels: dataManager.getChannels(),
    feeds: dataManager.getFeeds(),
    logos: dataManager.getLogos(),
    streams: dataManager.getStreams()
  }

  return output
}

export async function save(data: Compile.Data) {
  function normalizePath(path: string): string {
    return path.replace(/^\/+/, '')
  }

  const packr = new Packr()

  function pack(data: Compile.PackedData | Compile.PackedData[]) {
    if (Array.isArray(data)) {
      const buffers = data.map(item => packr.pack(item))

      return Buffer.concat(buffers)
    }

    return packr.pack(data)
  }

  const staticStorage = new Storage(STATIC_DIR)
  const limit = pLimit(500)

  await Promise.all([
    limit(() => staticStorage.save('data/searchable.msgpack', pack(data.searchable))),
    limit(() => staticStorage.save('data/countries.msgpack', pack(data.countries))),
    limit(() => staticStorage.save('data/channelStubs.msgpack', pack(data.channelStubs))),
    limit(() => staticStorage.save('data/streams.msgpack', pack(data.streams)))
  ])

  const feedsByChannelId = Map.groupBy(data.feeds, feed => feed.channelId)
  const logosByChannelId = Map.groupBy(data.logos, logo => logo.channelId)

  const channelIndex = []
  const channelPromises = data.channels.flatMap(channel => {
    channelIndex.push(channel.id)

    const feeds = feedsByChannelId.get(channel.id) ?? []
    const logos = logosByChannelId.get(channel.id) ?? []

    return [
      limit(() => staticStorage.save(normalizePath(channel.dataPath), pack(channel))),
      limit(() => staticStorage.save(normalizePath(channel.feedsPath), pack(feeds))),
      limit(() => staticStorage.save(normalizePath(channel.logosPath), pack(logos)))
    ]
  })

  await Promise.all(channelPromises)

  await staticStorage.save('data/channelIndex.msgpack', pack(channelIndex))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
