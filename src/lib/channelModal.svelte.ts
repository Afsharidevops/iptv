import { toast } from '@zerodevx/svelte-toast'
import { unpackObject } from '$lib/utils'
import type { Channel } from '$lib/types'

class ChannelModalManager {
  originUrl = $state<URL | null>(null)
  currentChannel = $state<Channel.Type | null>(null)

  setOriginUrl(url: URL) {
    if (url.pathname === '/') this.originUrl = url
  }

  async updateChannel(channelId: string) {
    if (!channelId) {
      this.currentChannel = null
      return
    }

    const [channelSlug, countryCode] = channelId.split('.')

    try {
      const channelBuffer = await fetch(
        `/data/channels/${countryCode}/${channelSlug}/_data.msgpack`
      ).then(res => res.arrayBuffer())

      this.currentChannel = unpackObject<Channel.Type>(channelBuffer)
    } catch (error) {
      if (error.name !== 'AbortError') toast.push(error.message)
    }
  }
}

export const channelModal = new ChannelModalManager()
