<script lang="ts">
  import { downloadMode } from '$lib/downloadMode.svelte'
  import IconButton from '../Common/IconButton.svelte'
  import type { Stream } from '$lib/types'

  const streams: Stream.Snippet[] = $derived(
    downloadMode.getStreams().map(stream => ({ hash: stream.hash, channelId: stream.channelId }))
  )
  const state = $derived(downloadMode.getSelectionState(streams))
</script>

<div class="px-2 w-full fixed bottom-10 sm:bottom-20 flex justify-center pointer-events-none">
  <div
    class="h-16 px-3 py-3 w-full min-w-[300px] max-w-[calc(100%-16px)] sm:w-[540px] bg-primary-850 rounded-lg pointer-events-auto"
  >
    <div class="flex justify-between items-center w-full max-w-7xl">
      <div class="text-sm text-gray-300 font-mono pl-2">
        {downloadMode.selectedStreams.size} selected
      </div>
      <div class="flex space-x-1 sm:space-x-2 items-center">
        {#if downloadMode.selectedStreams.size > 0}
          <IconButton
            variant="dark"
            title="Reset"
            onClick={() => downloadMode.deselectAllStreams()}
            iconSize={24}
            iconName="Reset"
          />
        {/if}
        <IconButton
          onClick={() => downloadMode.toggleActiveSelection()}
          title={state.isSelected ? 'Deselect All' : 'Select All'}
          variant="dark"
          iconName={state.isSelected ? 'DeselectAll' : 'SelectAll'}
          iconSize={24}
        />
        <IconButton
          variant="dark"
          onClick={() => downloadMode.downloadPlaylist()}
          disabled={downloadMode.selectedStreams.size === 0}
          title="Download Playlist"
          iconName="Download"
          iconSize={16}
        />
        <IconButton
          variant="dark"
          onClick={() => (downloadMode.isEnabled = false)}
          title="Close"
          iconName="Close"
          iconSize={20}
        />
      </div>
    </div>
  </div>
</div>
