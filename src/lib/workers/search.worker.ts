import type { Channel } from '$lib/types'
import sjs from '@freearhey/search-js'
import { unpack } from '$lib/utils'

const searchResults = new Set()
const searchResultsInit = new Set()
let searchIndex = null

self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data

  try {
    switch (type) {
      case 'INIT': {
        const searchableBuffer = await fetch('/data/searchable.msgpack').then(res =>
          res.arrayBuffer()
        )

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
            const results: Channel.Searchable[] = searchIndex.search(payload.query)
            searchResults.clear()
            results.forEach(result => searchResults.add(result.id))
            self.postMessage({
              type: 'SEARCH_RESULTS_CHANGED',
              payload: { searchResults, expandResults: true }
            })
          } else {
            searchResults.clear()
            self.postMessage({
              type: 'SEARCH_RESULTS_CHANGED',
              payload: { searchResults, expandResults: false }
            })
          }
        } else {
          searchResults.clear()
          searchResultsInit.forEach(i => searchResults.add(i), searchResults.clear())
          self.postMessage({
            type: 'SEARCH_RESULTS_CHANGED',
            payload: { searchResults, expandResults: false }
          })
        }
        break
      }
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', payload: { message: error.message } })
  }
}
