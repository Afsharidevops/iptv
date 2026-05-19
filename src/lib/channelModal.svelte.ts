import { toast } from '@zerodevx/svelte-toast'
import { unpackObject } from '$lib/utils'
import type { Channel } from '$lib/types'

class ChannelModalManager {
  originUrl = $state<URL | null>(null)
  currentChannel = $state<Channel.Type | null>(null)
  #abortController: AbortController | null = null

  setOriginUrl(url: URL) {
    if (url.pathname === '/') this.originUrl = url
  }

  async updateChannel(channelId: string) {
    this.#abortController?.abort()

    if (!channelId) {
      this.currentChannel = null
      return
    }

    const [channelSlug, countryCode] = channelId.split('.')

    this.#abortController = new AbortController()

    try {
      const channelBuffer = await fetch(
        `/data/channels/${countryCode}/${channelSlug}/_data.msgpack`,
        { signal: this.#abortController.signal }
      ).then(res => res.arrayBuffer())

      this.currentChannel = unpackObject<Channel.Type>(channelBuffer)
    } catch (error) {
      if (error.name !== 'AbortError') toast.push(error.message)
    } finally {
      if (this.#abortController?.signal.aborted === false) {
        this.#abortController = null
      }
    }
  }
}

export const channelModal = new ChannelModalManager()
