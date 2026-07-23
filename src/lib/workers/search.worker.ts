import type { Channel } from '$lib/types'
import sjs from '@freearhey/search-js'
import { unpack } from '$lib/utils'
import { base } from '$app/paths'

const searchResults = new Set<string>()
const searchResultsInit = new Set<string>()

let searchIndex: ReturnType<typeof sjs.createIndex> | null = null

self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data

  try {
    switch (type) {
      case 'INIT': {
        const response = await fetch(`${base}/data/searchable.msgpack`)
      
        if (!response.ok) {
          throw new Error(
            `Unable to load searchable.msgpack: HTTP ${response.status}`
          )
        }
      
        const searchableBuffer = await response.arrayBuffer()
        const searchable = unpack<Channel.Searchable>(searchableBuffer)
      
        searchIndex = sjs.createIndex(searchable)
      
        searchable.forEach(channel => {
          searchResults.add(channel.id)
          searchResultsInit.add(channel.id)
        })
      
        self.postMessage({ type: 'READY' })
        break
      }

      case 'SEARCH': {
        if (payload.query) {
          if (searchIndex) {
            const results: Channel.Searchable[] = searchIndex.search(
              payload.query
            )

            searchResults.clear()

            results.forEach(result => {
              searchResults.add(result.id)
            })

            self.postMessage({
              type: 'SEARCH_RESULTS_CHANGED',
              payload: {
                searchResults,
                expandResults: true
              }
            })
          } else {
            searchResults.clear()

            self.postMessage({
              type: 'SEARCH_RESULTS_CHANGED',
              payload: {
                searchResults,
                expandResults: false
              }
            })
          }
        } else {
          searchResults.clear()

          searchResultsInit.forEach(id => {
            searchResults.add(id)
          })

          self.postMessage({
            type: 'SEARCH_RESULTS_CHANGED',
            payload: {
              searchResults,
              expandResults: false
            }
          })
        }

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
