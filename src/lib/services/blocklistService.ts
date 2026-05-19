import type { BlocklistRecord } from '$lib/types'
import hashObject from 'object-hash'
import * as sdk from '@iptv-org/sdk'

export class BlocklistService {
  records = new Map<string, BlocklistRecord.Type>()
  recordsGroupedByChannelId = new Map<string, BlocklistRecord.Type[]>()

  constructor(rawRecords: sdk.Types.BlocklistRecordData[]) {
    for (const data of rawRecords) {
      const hash = hashObject(data)
      const record: BlocklistRecord.Type = {
        hash,
        channelId: data.channel,
        reason: data.reason,
        ref: data.ref
      }

      this.records.set(hash, record)
    }

    this.recordsGroupedByChannelId = Map.groupBy(this.records.values(), record => record.channelId)
  }

  getRecordsByChannelId(channelId: string): BlocklistRecord.Type[] {
    return this.recordsGroupedByChannelId.get(channelId)
  }

  static getRefLabel(ref: string): string {
    let refLabel = ''

    const isIssue = /issues|pull/.test(ref)
    const isAttachment = /github\.zendesk\.com\/attachments\/token/.test(ref)
    if (isIssue) {
      const parts = ref.split('/')
      const issueId = parts.pop()
      refLabel = `#${issueId}`
    } else if (isAttachment) {
      const [, filename] = ref.match(/\?name=(.*)/) || [null, undefined]
      refLabel = filename
    } else {
      refLabel = ref.split('/').pop()
    }

    return refLabel
  }

  static getEnrichedRecord(record: BlocklistRecord.Type): BlocklistRecord.Type {
    return {
      ...record,
      refLabel: BlocklistService.getRefLabel(record.ref)
    }
  }
}
