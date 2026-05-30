import type { Channel, Country, Feed, Logo, Stream } from '.'

export type Data = {
  countries: Country.Type[]
  searchable: Channel.Searchable[]
  channels: Channel.Type[]
  channelStubs: Channel.Stub[]
  streams: Stream.Type[]
  feeds: Feed.Type[]
  logos: Logo.Type[]
}

export type PackedData = Data[keyof Data][number]
