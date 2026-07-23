import type { Stream } from '$lib/types'
import { unpack } from '$lib/utils'
import { base } from '$app/paths'

self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data

  try {
    switch (type) {
      case 'INIT': {
        const response = await fetch(`${base}/data/streams.msgpack`)
      
        if (!response.ok) {
          throw new Error(
            `Unable to load streams.msgpack: HTTP ${response.status}`
          )
        }
      
        const streamsBuffer = await response.arrayBuffer()
        const streams = unpack<Stream.Type>(streamsBuffer)
      
        self.postMessage({ type: 'READY', payload: { streams } })
        break
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error)

    self.postMessage({
      type: 'ERROR',
      payload: { message }
    })
  }
}
