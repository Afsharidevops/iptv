import type { Stream } from '$lib/types'
import { unpack } from '$lib/utils'
import { asset } from '$app/paths'

self.onmessage = async (event: MessageEvent) => {
  const { type } = event.data

  try {
    switch (type) {
      case 'INIT': {
        const response = await fetch(asset('/data/streams.msgpack'))

        if (!response.ok) {
          throw new Error(`Unable to load streams data: HTTP ${response.status}`)
        }

        const streamsBuffer = await response.arrayBuffer()
        const streams = unpack<Stream.Type[]>(streamsBuffer)

        self.postMessage({
          type: 'READY',
          payload: { streams }
        })

        break
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    self.postMessage({
      type: 'ERROR',
      payload: { message }
    })
  }
}
