import type { Timezone } from '$lib/types'
import * as sdk from '@iptv-org/sdk'

export class TimezoneService {
  timezones = new Map<string, Timezone.Type>()

  constructor(rawStreams: sdk.Types.TimezoneData[]) {
    for (const data of rawStreams) {
      const timezone: Timezone.Type = {
        id: data.id,
        utcOffset: data.utc_offset
      }

      this.timezones.set(timezone.id, timezone)
    }
  }

  getTimezone(id: string): Timezone.Type | undefined {
    return this.timezones.get(id)
  }
}
