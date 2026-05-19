import type { HTMLPreviewField } from '$lib/components/HTMLPreview/types'
import type { Category, Logo, Stream } from '$lib/types'
import { orderBy } from 'natural-orderby'
import hashObject from 'object-hash'
import * as sdk from '@iptv-org/sdk'

export class StreamService {
  streams = new Map<string, Stream.Type>()
  streamsGroupedById = new Map<string, Stream.Type[]>()
  streamsGroupedByChannelId = new Map<string, Stream.Type[]>()
  streamsGroupedByCountryCode = new Map<string, Stream.Type[]>()

  constructor(rawStreams: sdk.Types.StreamData[]) {
    const unsortedStreams = []
    for (const data of rawStreams) {
      const id = StreamService.getId({ channelId: data.channel, feedId: data.feed })
      if (!id) continue

      const hash = hashObject(data)

      let [, countryCode] = data.channel.split('.')
      countryCode = countryCode.toUpperCase()

      const stream: Stream.Type = {
        hash,
        id,
        channelId: data.channel,
        feedId: data.feed,
        fullTitle: StreamService.getFullTitle({
          title: data.title,
          quality: data.quality,
          label: data.label
        }),
        verticalResolution: StreamService.getVerticalResolution(data.quality),
        url: data.url,
        title: data.title,
        referrer: data.referrer,
        userAgent: data.user_agent,
        quality: data.quality,
        label: data.label,
        countryCode
      }

      unsortedStreams.push(stream)
    }

    const sortedStreams = orderBy(
      unsortedStreams,
      [stream => stream.fullTitle, stream => stream.verticalResolution, stream => stream.url],
      ['asc', 'desc', 'asc']
    )

    for (const stream of sortedStreams) {
      this.streams.set(stream.hash, stream)
    }

    this.streamsGroupedById = Map.groupBy(sortedStreams, stream => stream.id)
    this.streamsGroupedByChannelId = Map.groupBy(sortedStreams, stream => stream.channelId)
    this.streamsGroupedByCountryCode = Map.groupBy(sortedStreams, stream => stream.countryCode)
  }

  static getId(data: { channelId: string; feedId: string | null }): string {
    if (data.feedId) return `${data.channelId}@${data.feedId}`
    return data.channelId
  }

  getStreams(): Stream.Type[] {
    return Array.from(this.streams.values())
  }

  getStreamsById(id: string): Stream.Type[] {
    return this.streamsGroupedById.get(id) || []
  }

  getStreamsByChannelId(channelId: string): Stream.Type[] {
    return this.streamsGroupedByChannelId.get(channelId) || []
  }

  getStreamsByCountryCode(countryCode: string): Stream.Type[] {
    return this.streamsGroupedByCountryCode.get(countryCode) || []
  }

  static getFieldset(data: {
    title: string
    url: string
    referrer: string
    userAgent: string
    quality: string
    label: string
  }): HTMLPreviewField[] {
    function toString(val: string | null) {
      return val ? { text: val, title: val } : null
    }

    return [
      { name: 'title', type: 'string', value: toString(data.title) },
      { name: 'url', type: 'string', value: toString(data.url) },
      { name: 'referrer', type: 'string', value: toString(data.referrer) },
      { name: 'user_agent', type: 'string', value: toString(data.userAgent) },
      { name: 'quality', type: 'string', value: toString(data.quality) },
      { name: 'label', type: 'string', value: toString(data.label) }
    ].filter((field: HTMLPreviewField) => field.value)
  }

  static getEditUrl(data: { displayName: string; url: string }): string {
    const endpoint = 'https://github.com/iptv-org/iptv/issues/new'
    const params = new URLSearchParams({
      labels: 'streams:edit',
      template: '2_streams_edit.yml',
      title: `Edit: ${data.displayName}`,
      stream_url: data.url
    })

    return `${endpoint}?${params.toString()}`
  }

  static getReportUrl(data: { displayName: string; url: string }): string {
    const endpoint = 'https://github.com/iptv-org/iptv/issues/new'
    const params = new URLSearchParams({
      labels: 'streams:remove',
      template: '3_streams_report.yml',
      title: `Report: ${data.displayName}`,
      stream_url: data.url
    })

    return `${endpoint}?${params.toString()}`
  }

  static getFullTitle(data: { title: string; quality: string; label: string }): string {
    let title = data.title
    if (data.quality) title += ` (${data.quality})`
    if (data.label) title += ` [${data.label}]`

    return title
  }

  static getVerticalResolution(quality: string): number {
    if (!quality) return 0

    return parseInt(quality.replace(/p|i/, ''))
  }

  static getEnrichedStream(
    stream: Stream.Type,
    data: { logos: Logo.Type[]; displayName: string; categories: Category.Type[] }
  ): Stream.Type {
    const { displayName, logos, categories } = data
    const { url } = stream
    const mainLogo = logos[0]

    return {
      ...stream,
      editUrl: StreamService.getEditUrl({ displayName, url }),
      reportUrl: StreamService.getReportUrl({ displayName, url }),
      logoUrl: mainLogo?.url ?? '',
      categories: categories.map(c => c.name),
      fieldset: StreamService.getFieldset(stream)
    }
  }
}
