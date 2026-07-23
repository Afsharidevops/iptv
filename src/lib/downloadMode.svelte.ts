import { SvelteSet, SvelteMap } from 'svelte/reactivity'
import { Playlist, Link } from 'iptv-playlist-generator'
import type { Stream } from '$lib/types'
import { search } from './search.svelte'
import { orderBy } from 'natural-orderby'
import DownloadModeWorker from '$lib/workers/downloadMode.worker?worker'
import { toast } from '@zerodevx/svelte-toast'
import { asset } from '$app/paths'

class DownloadModeState {
  isEnabled = $state(false)
  streams = new SvelteMap<string, Stream.Type>()
  selectedStreams = new SvelteSet<string>()
  downloadModeWorker = $state<Worker | null>(null)

  init() {
    this.downloadModeWorker = new DownloadModeWorker()
    this.downloadModeWorker.postMessage({
      type: 'INIT',
      payload: {
        dataUrl: asset('/data/streams.msgpack')
      }
    })
    this.downloadModeWorker.onmessage = (event: MessageEvent) => {
      const { type, payload } = event.data

      switch (type) {
        case 'READY':
          this.streams.clear()
          for (const stream of payload.streams) {
            this.streams.set(stream.hash, stream)
          }
          break
        case 'ERROR':
          toast.push(payload.message)
          break
      }
    }
  }

  toggle() {
    this.isEnabled = !this.isEnabled

    if (this.isEnabled && !this.downloadModeWorker) {
      this.init()
    }
  }

  getStreams() {
    return Array.from(this.streams.values())
  }

  getSelectedStreams(): Stream.Type[] {
    return Array.from(this.selectedStreams)
      .map(hash => this.streams.get(hash))
      .filter(Boolean)
  }

  selectStreams(streams: Stream.Snippet[]) {
    streams.forEach(stream => {
      this.selectedStreams.add(stream.hash)
    })
  }

  deselectStreams(streams: Stream.Snippet[]) {
    streams.forEach(stream => {
      this.selectedStreams.delete(stream.hash)
    })
  }

  deselectAllStreams() {
    this.selectedStreams.clear()
  }

  toggleActiveSelection() {
    const streams: Stream.Snippet[] = this.getStreams().map(stream => ({
      hash: stream.hash,
      channelId: stream.channelId
    }))
    const state = this.getSelectionState(streams)

    if (!state.isSelected) {
      this.selectStreams(state.active)
    } else {
      this.deselectStreams(state.active)
    }
  }

  getSelectionState(streams: Stream.Snippet[]) {
    const active = streams.filter(s => search.searchResults.has(s.channelId))
    const selected = active.filter(s => this.selectedStreams.has(s.hash))

    return {
      active,
      selected,
      get isSelected() {
        return this.active.length > 0 && this.selected.length === this.active.length
      },
      get isIndeterminate() {
        return this.selected.length > 0 && !this.isSelected
      },
      get isDisabled() {
        return this.active.length === 0
      }
    }
  }

  createPlaylist(): Playlist {
    const playlist = new Playlist()

    const sortedStreams = orderBy(
      this.getSelectedStreams(),
      [stream => stream.fullTitle, stream => stream.verticalResolution, stream => stream.url],
      ['asc', 'desc', 'asc']
    )

    sortedStreams.forEach(stream => {
      const link = new Link(stream.url)

      link.title = stream.fullTitle
      link.attrs = {
        'tvg-id': stream.id,
        'tvg-logo': stream.logoUrl,
        'group-title': stream.categories.join(';')
      }

      if (stream.userAgent) {
        link.attrs['user-agent'] = stream.userAgent
        link.vlcOpts['http-user-agent'] = stream.userAgent
      }

      if (stream.referrer) {
        link.attrs['referrer'] = stream.referrer
        link.vlcOpts['http-referrer'] = stream.referrer
      }

      playlist.links.push(link)
    })

    return playlist
  }

  downloadPlaylist() {
    const playlist = downloadMode.createPlaylist()
    const downloadLink = this.createDownloadLink(playlist.toString())
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  createDownloadLink(string) {
    const blob = new Blob([string], { type: 'text/plain' })
    const url = window.URL || window.webkitURL
    const objUrl = url.createObjectURL(blob)

    const a = document.createElement('a')
    a.setAttribute('download', `playlist.m3u`)
    a.setAttribute('href', objUrl)

    return a
  }
}

export const downloadMode = new DownloadModeState()
