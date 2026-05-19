import type { Stream } from '$lib/types'
import { unpack } from '$lib/utils'

self.onmessage = async (event: MessageEvent) => {
  const { type } = event.data

  try {
    switch (type) {
      case 'INIT': {
        const streamsBuffer = await fetch('/data/streams.msgpack').then(res => res.arrayBuffer())

        const streams = unpack<Stream.Type>(streamsBuffer)

        self.postMessage({ type: 'READY', payload: { streams } })
        break
      }
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', payload: { message: error.message } })
  }
}
