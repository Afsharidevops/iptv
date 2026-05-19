import SearchWorker from '$lib/workers/search.worker?worker'
import { SvelteSet } from 'svelte/reactivity'
import { toast } from '@zerodevx/svelte-toast'

class SearchState {
  query = $state('')
  isReady = $state(false)
  isSearching = $state(false)
  expandResults = $state(false)
  searchResults = new SvelteSet<string>()
  searchResultsInit = new SvelteSet<string>()
  searchIndex = $state(null)
  searchWorker = $state<Worker | null>(null)

  init() {
    this.searchWorker = new SearchWorker()
    this.searchWorker.postMessage({ type: 'INIT' })
    this.searchWorker.onmessage = (event: MessageEvent) => {
      const { type, payload } = event.data

      switch (type) {
        case 'READY':
          this.submit()
          break
        case 'SEARCH_RESULTS_CHANGED':
          this.expandResults = payload.expandResults
          this.searchResults.clear()
          for (const id of payload.searchResults) {
            this.searchResults.add(id)
          }
          this.isReady = true
          this.isSearching = false
          break
        case 'ERROR':
          toast.push(payload.message)
          break
      }
    }
  }

  submit() {
    if (this.searchWorker) {
      this.isSearching = true
      this.searchWorker.postMessage({ type: 'SEARCH', payload: { query: this.query } })
    }
  }
}

export const search = new SearchState()
