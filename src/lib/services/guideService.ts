import { StreamService } from './streamService'
import type * as Guide from '$lib/types/guide'
import hashObject from 'object-hash'
import * as sdk from '@iptv-org/sdk'

export class GuideService {
  guides = new Map<string, Guide.Type>()
  guidesGroupedByStreamId = new Map<string, Guide.Type[]>()
  guidesGroupedByChannelId = new Map<string, Guide.Type[]>()

  constructor(rawGuides: sdk.Types.GuideData[]) {
    for (const data of rawGuides) {
      const hash = hashObject(data)
      const guide: Guide.Type = {
        hash,
        channelId: data.channel,
        feedId: data.feed,
        site: data.site,
        siteName: data.site_name,
        siteId: data.site_id,
        lang: data.lang,
        url: GuideService.getUrl(data.site),
        streamId: StreamService.getId({ channelId: data.channel, feedId: data.feed })
      }

      this.guides.set(guide.hash, guide)
    }

    const guides = Array.from(this.guides.values())

    this.guidesGroupedByStreamId = Map.groupBy(guides, guide => guide.streamId)
    this.guidesGroupedByChannelId = Map.groupBy(guides, guide => guide.channelId)
  }

  getGuides(): Guide.Type[] {
    return Array.from(this.guides.values())
  }

  getGuidesByChannelId(channelId: string): Guide.Type[] {
    return this.guidesGroupedByChannelId.get(channelId) ?? []
  }

  getGuidesByStreamId(streamId: string): Guide.Type[] {
    return this.guidesGroupedByStreamId.get(streamId) ?? []
  }

  static getUrl(site: string): string {
    return site ? `https://${site}` : ''
  }

  static getEnrichedGuide(guide: Guide.Type): Guide.Type {
    return {
      ...guide
    }
  }
}
