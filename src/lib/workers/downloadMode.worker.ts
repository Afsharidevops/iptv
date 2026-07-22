import type { Stream } from '$lib/types'
import { unpack } from '$lib/utils'

self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data

  try {
    switch (type) {
      case 'INIT': {
        const dataUrl = payload?.dataUrl

        if (!dataUrl) {
          throw new Error('Streams data URL was not provided')
        }

        const response = await fetch(dataUrl)

        if (!response.ok) {
          throw new Error(
            `Unable to load streams data: HTTP ${response.status}`
          )
        }

        const streamsBuffer = await response.arrayBuffer()
        const streams = unpack<Stream.Type>(streamsBuffer)

        self.postMessage({
          type: 'READY',
          payload: { streams }
        })

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
