import { describe, test, expect, beforeEach, vi, beforeAll, afterEach, afterAll } from 'vitest'
import compile from '../../../src/commands/data/compile'
import { pathToFileURL } from 'node:url'
import * as glob from 'glob'
import fs from 'fs-extra'

vi.hoisted(() => {
  vi.stubEnv('DATA_DIR', 'tests/__data__/input/data')
  vi.stubEnv('STATIC_DIR', 'tests/__data__/output')
})

describe('compile', () => {
  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterAll(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  beforeEach(() => {
    fs.emptyDirSync('tests/__data__/output')
  })

  afterEach(() => {})

  test('it can compile valid output', async () => {
    expect(process.env.DATA_DIR).toBe('tests/__data__/input/data')
    expect(process.env.STATIC_DIR).toBe('tests/__data__/output')

    await compile()

    const files = glob.sync('tests/__data__/expected/compile/**/*.msgpack').map(filepath => {
      const fileUrl = pathToFileURL(filepath).toString()
      const pathToRemove = pathToFileURL('tests/__data__/expected/compile/').toString()

      return fileUrl.replace(pathToRemove, '')
    })

    files.forEach((filepath: string) => {
      expect(content(`tests/__data__/output/${filepath}`), filepath).toBe(
        content(`tests/__data__/expected/compile/${filepath}`)
      )
    })
  })
})

function content(filepath: string) {
  return fs.readFileSync(pathToFileURL(filepath), { encoding: 'utf8' })
}
