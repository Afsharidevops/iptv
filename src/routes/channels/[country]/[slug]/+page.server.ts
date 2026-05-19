import { unpack, unpackObject } from '$lib/utils'
import { STATIC_DIR } from '$lib/constants'
import { error } from '@sveltejs/kit'
import path from 'path'
import fs from 'fs'

export async function entries() {
  const channelsBuffer = fs.readFileSync(path.resolve(STATIC_DIR, 'data/channelIndex.msgpack'))
  const channels = unpack(channelsBuffer)

  if (!Array.isArray(channels)) return []

  return channels.map(id => {
    const [slug, country] = id.split('.')
    return { country, slug }
  })
}

export async function load({ params }) {
  const { country, slug } = params

  const channelBuffer = fs.readFileSync(
    path.resolve(STATIC_DIR, `data/channels/${country}/${slug}/_data.msgpack`)
  )
  const channel = unpackObject(channelBuffer)

  if (!channel) {
    throw error(404)
  }

  const feedsBuffer = fs.readFileSync(
    path.resolve(STATIC_DIR, `data/channels/${country}/${slug}/feeds.msgpack`)
  )
  const feeds = unpack(new Uint8Array(feedsBuffer))

  return {
    channel,
    feeds
  }
}
