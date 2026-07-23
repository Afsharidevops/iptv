import { describe, test, expect, beforeEach, vi, beforeAll, afterEach, afterAll } from 'vitest'
import compileCommand, {
  compile,
  excludeCountries,
  load
} from '../../../src/commands/data/compile'
import { pathToFileURL } from 'node:url'
import * as glob from 'glob'
import fs from 'fs-extra'

vi.hoisted(() => {
  vi.stubEnv('DATA_DIR', 'tests/__data__/input/data')
  vi.stubEnv('STATIC_DIR', 'tests/__data__/output')
})

describe('compile', () => {
  beforeAll(() => {
    if (process.env.DEBUG !== 'true') {
      vi.spyOn(console, 'log').mockImplementation(() => {})
    }
  })

  afterAll(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  beforeEach(() => {
    fs.emptyDirSync('tests/__data__/output')
  })

  afterEach(() => {})

  test('compile()', async () => {
    const rawData = await load()
    const output = compile(rawData)

    expect(output.feeds[0].streamId).toBe('AndorraTV.ad@SD')
    expect(output.feeds[0].isBlocked).toBe(true)
    expect(output.feeds[0].isClosed).toBe(true)
    expect(output.countries.some(country => country.code === 'IL')).toBe(false)
    expect(output.channels.some(channel => channel.countryCode === 'IL')).toBe(false)
    expect(output.channelStubs.some(channel => channel.countryCode === 'IL')).toBe(false)
    expect(output.searchable.some(channel => channel.country === 'IL')).toBe(false)
    expect(output.streams.some(stream => stream.countryCode === 'IL')).toBe(false)
  })

  test('excludeCountries() removes the country and all channel references', () => {
    const data = {
      blocklist: [{ channel: 'Remove.il' }, { channel: 'Keep.us' }],
      channels: [
        { id: 'Remove.il', country: 'IL', replaced_by: null },
        { id: 'Keep.us', country: 'US', replaced_by: 'Remove.il' }
      ],
      cities: [
        { code: 'ILTLV', country: 'IL' },
        { code: 'USNYC', country: 'US' }
      ],
      countries: [{ code: 'IL' }, { code: 'US' }],
      feeds: [
        { channel: 'Remove.il@HD', broadcast_area: ['c/IL', 'ct/ILTLV'] },
        { channel: 'Keep.us', broadcast_area: ['c/US', 'c/IL', 'r/EMPTY'] }
      ],
      guides: [{ channel: 'Remove.il' }, { channel: 'Keep.us' }],
      logos: [{ channel: 'Remove.il' }, { channel: 'Keep.us' }],
      regions: [
        { code: 'MIXED', countries: ['US', 'IL'] },
        { code: 'EMPTY', countries: ['IL'] }
      ],
      streams: [{ channel: 'Remove.il' }, { channel: 'Keep.us' }],
      subdivisions: [
        { code: 'IL-TA', country: 'IL' },
        { code: 'US-NY', country: 'US' }
      ]
    } as unknown as Parameters<typeof excludeCountries>[0]

    const output = excludeCountries(data)

    expect(output.countries).toEqual([{ code: 'US' }])
    expect(output.channels).toEqual([{ id: 'Keep.us', country: 'US', replaced_by: null }])
    expect(output.cities).toEqual([{ code: 'USNYC', country: 'US' }])
    expect(output.subdivisions).toEqual([{ code: 'US-NY', country: 'US' }])
    expect(output.regions).toEqual([{ code: 'MIXED', countries: ['US'] }])
    expect(output.feeds).toEqual([{ channel: 'Keep.us', broadcast_area: ['c/US'] }])
    expect(output.blocklist).toEqual([{ channel: 'Keep.us' }])
    expect(output.guides).toEqual([{ channel: 'Keep.us' }])
    expect(output.logos).toEqual([{ channel: 'Keep.us' }])
    expect(output.streams).toEqual([{ channel: 'Keep.us' }])
  })

  test('it can compile valid output', async () => {
    expect(process.env.DATA_DIR).toBe('tests/__data__/input/data')
    expect(process.env.STATIC_DIR).toBe('tests/__data__/output')

    await compileCommand()

    const files = glob.sync('tests/__data__/expected/compile/**/*.msgpack').map(filepath => {
      const fileUrl = pathToFileURL(filepath).toString()
      const pathToRemove = pathToFileURL('tests/__data__/expected/compile/').toString()

      return fileUrl.replace(pathToRemove, '')
    })

    files.forEach((filepath: string) => {
      const actual = content(`tests/__data__/output/${filepath}`)
      const expected = content(`tests/__data__/expected/compile/${filepath}`)

      expect(actual, filepath).toEqual(expected)
    })
  })
})

function content(filepath: string): Buffer {
  return fs.readFileSync(pathToFileURL(filepath))
}
