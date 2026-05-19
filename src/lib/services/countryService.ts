import * as Flag from 'country-flag-icons/string/3x2'
import type * as Country from '$lib/types/country'
import type { Stream } from '$lib/types'
import * as sdk from '@iptv-org/sdk'

export class CountryService {
  countries = new Map<string, Country.Type>()

  constructor(rawCountries: sdk.Types.CountryData[]) {
    this.countries = new Map(rawCountries.map(country => [country.code, country]))
  }

  getCountries(): Country.Type[] {
    return Array.from(this.countries.values())
  }

  getCountry(code: string): Country.Type {
    return this.countries.get(code)
  }

  static getFlag(code: string): string {
    return code === 'UK' ? Flag['GB'] : Flag[code]
  }

  static getEnrichedCountry(country: Country.Type, data: { streams: Stream.Type[] }): Country.Type {
    const { streams } = data

    return {
      ...country,
      hasStreams: !!streams.length,
      streams: streams.map(stream => ({
        channelId: stream.channelId,
        hash: stream.hash
      })),
      flag: CountryService.getFlag(country.code),
      isExpanded: false
    }
  }
}
