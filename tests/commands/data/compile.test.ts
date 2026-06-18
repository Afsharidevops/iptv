import { describe, test, expect, beforeEach, vi, beforeAll, afterEach, afterAll } from 'vitest'
import compileCommand, { compile, load } from '../../../src/commands/data/compile'
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
