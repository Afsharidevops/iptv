<script lang="ts">
  import { StreamMenu, HTMLPreview, SelectButton, IconButton } from '$lib/components'
  import { downloadMode } from '$lib/downloadMode.svelte'
  import type { Stream } from '$lib/types'
  import { fade } from 'svelte/transition'
  import * as Icon from '$lib/icons'

  interface Props {
    stream: Stream.Type
  }

  const { stream }: Props = $props()

  let isExpanded = $state(false)
  function toggleIsExpanded() {
    isExpanded = !isExpanded
  }
</script>

<div class="relative" class:pl-12={downloadMode.isEnabled}>
  <div
    transition:fade={{ duration: 200 }}
    class="w-12 h-14 shrink-0 flex items-center absolute left-0"
    class:opacity-0={!downloadMode.isEnabled}
    class:opacity-100={downloadMode.isEnabled}
    class:pointer-events-auto={downloadMode.isEnabled}
    class:pointer-events-none={!downloadMode.isEnabled}
  >
    <SelectButton streams={[{ hash: stream.hash, channelId: stream.channelId }]} />
  </div>
  <div class="w-full rounded-md border border-gray-200 dark:border-gray-700">
    <div
      class="w-full inline-flex justify-between px-2 py-1.5 border-gray-200 dark:border-gray-700"
      class:border-b={isExpanded}
    >
      <div class="flex space-x-2 items-center w-full">
        <div class:rotate-180={isExpanded}>
          <IconButton
            onClick={toggleIsExpanded}
            size={32}
            title={isExpanded ? 'Collapse' : 'Expand'}
            iconName="Expand"
            iconSize={20}
          />
        </div>
        <div class="flex w-full items-center space-x-1 overflow-hidden">
          <div class="truncate text-gray-600 dark:text-gray-100">
            <a
              class="whitespace-nowrap text-sm hover:text-blue-500 dark:hover:text-blue-400 hover:underline"
              href={stream.url}
              title={stream.url}
              target="_blank"
              rel="noopener noreferrer external"
            >
              {stream.url}</a
            >
          </div>
          <div class="text-sm text-gray-400 dark:text-gray-500">
            <Icon.ExternalLink size={17} />
          </div>
        </div>
        <div class="flex w-9 justify-end shrink-0">
          <StreamMenu {stream} />
        </div>
      </div>
    </div>
    {#if isExpanded}
      <div class="w-full flex px-6 pt-5 pb-2">
        <HTMLPreview fieldset={stream.fieldset} />
      </div>
    {/if}
  </div>
</div>
