import type { HTMLPreviewField } from '$lib/components/HTMLPreview/types'
import { StreamService } from './streamService'
import type { Logo } from '$lib/types'
import * as sdk from '@iptv-org/sdk'
import hashObject from 'object-hash'
import { orderBy } from 'es-toolkit'

function inUse(logo: Logo.Type): number {
  return logo.inUse ? 1 : -1
}

function byFeed(logo: Logo.Type): number {
  if (!logo.feedId) return 1
  return 0
}

function byFormat(logo: Logo.Type): number {
  const levelByFormat = { SVG: 2, PNG: 1, APNG: 1, WebP: 1, AVIF: 1, JPEG: 0, GIF: 0 }

  return levelByFormat[logo.format] || 0
}

function bySize(logo: Logo.Type): number {
  return Math.abs(512 - logo.width) + Math.abs(512 - logo.height)
}

export class LogoService {
  logos = new Map<string, Logo.Type>()
  logosGroupedByChannelId = new Map<string, Logo.Type[]>()
  logosGroupedByStreamId = new Map<string, Logo.Type[]>()

  constructor(rawLogos: sdk.Types.LogoData[]) {
    const unsortedLogos: Logo.Type[] = rawLogos.map(data => {
      const hash = hashObject(data)
      return {
        hash,
        channelId: data.channel,
        feedId: data.feed,
        url: data.url,
        inUse: data.in_use,
        width: data.width,
        height: data.height,
        format: data.format,
        tags: data.tags,
        streamId: StreamService.getId({ channelId: data.channel, feedId: data.feed })
      }
    })

    const sortedLogos = orderBy(
      unsortedLogos,
      [inUse, byFeed, byFormat, bySize],
      ['desc', 'desc', 'desc', 'asc']
    )

    for (const logo of sortedLogos) {
      this.logos.set(logo.hash, logo)
    }

    this.logosGroupedByChannelId = Map.groupBy(sortedLogos, logo => logo.channelId)
    this.logosGroupedByStreamId = Map.groupBy(sortedLogos, logo => logo.streamId)
  }

  getLogos(): Logo.Type[] {
    return Array.from(this.logos.values())
  }

  getLogosByStreamId(streamId: string): Logo.Type[] {
    return this.logosGroupedByStreamId.get(streamId) || []
  }

  getLogosByChannelId(channelId: string): Logo.Type[] {
    return this.logosGroupedByChannelId.get(channelId) || []
  }

  static getEditUrl(data: {
    displayName: string
    feedId: string | null
    channelId: string | null
    url: string
  }): string {
    const endpoint = 'https://github.com/iptv-org/database/issues/new'
    const params = new URLSearchParams({
      labels: 'logos:edit',
      template: '08_logos_edit.yml',
      title: `Edit: ${data.displayName} Logo`,
      feed_id: data.feedId || '',
      channel_id: data.channelId,
      logo_url: data.url
    })

    return `${endpoint}?${params.toString()}`
  }

  static getRemoveUrl(data: {
    displayName: string
    feedId: string | null
    channelId: string | null
    url: string
  }): string {
    const endpoint = 'https://github.com/iptv-org/database/issues/new'
    const params = new URLSearchParams({
      labels: 'logos:remove',
      template: '09_logos_remove.yml',
      title: `Remove: ${data.displayName} Logo`,
      feed_id: data.feedId || '',
      channel_id: data.channelId,
      logo_url: data.url
    })

    return `${endpoint}?${params.toString()}`
  }

  static getEnrichedLogo(
    logo: Logo.Type,
    data: { displayName: string; hasMainFeed: boolean }
  ): Logo.Type {
    const { feedId, channelId, url } = logo
    const { displayName, hasMainFeed } = data

    return {
      ...logo,
      editUrl: LogoService.getEditUrl({ displayName, feedId, channelId, url }),
      removeUrl: LogoService.getRemoveUrl({ displayName, feedId, channelId, url }),
      fieldset: LogoService.getFieldset(logo),
      hasMainFeed,
      displayName
    }
  }

  static getFieldset(logo: Logo.Type): HTMLPreviewField[] {
    function toString(val: string | string[] | null) {
      if (val != null && (!Array.isArray(val) || val.length))
        return { text: val.toString(), title: val.toString() }
      return null
    }

    function toList(values: string[]) {
      if (values?.length) return values.map(val => ({ text: val, title: val }))
      return null
    }

    const { url, feedId, inUse, tags, width, height, format } = logo

    return [
      { name: 'url', type: 'string', value: toString(url) },
      { name: 'feed', type: 'string', value: toString(feedId) },
      { name: 'in_use', type: 'string', value: toString(inUse) },
      { name: 'tags', type: 'string[]', value: toList(tags) },
      { name: 'width', type: 'string', value: toString(width) },
      { name: 'height', type: 'string', value: toString(height) },
      { name: 'format', type: 'string', value: toString(format) }
    ].filter(f => f.value)
  }
}
