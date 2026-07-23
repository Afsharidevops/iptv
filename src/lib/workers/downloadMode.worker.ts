import type { Stream } from '$lib/types'
import { unpack } from '$lib/utils'

self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data

  try {
    switch (type) {
      case 'INIT': {
        if (!payload?.dataUrl) {
          throw new Error('Stream data URL is missing')
        }

        const response = await fetch(payload.dataUrl)

        if (!response.ok) {
          throw new Error(`Unable to load streams.msgpack: HTTP ${response.status}`)
        }

        const streamsBuffer = await response.arrayBuffer()
        const streams = unpack<Stream.Type>(streamsBuffer)

        self.postMessage({ type: 'READY', payload: { streams } })
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
