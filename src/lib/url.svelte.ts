import { goto } from '$app/navigation'
import { resolve } from '$app/paths'

class UrlManager {
  setSearchParam(value?: string) {
    let query: string = ''
    if (typeof value === 'string') {
      query = value
    }

    goto(`${resolve('/')}?q=${encodeURIComponent(query)}`)
  }
}

export const url = new UrlManager()
