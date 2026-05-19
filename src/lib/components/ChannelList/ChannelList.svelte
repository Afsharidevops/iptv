<script lang="ts">
  import { search } from '$lib/search.svelte'
  import type { Channel } from '$lib/types'
  import * as ChannelList from './'

  interface Props {
    channels: Channel.Stub[]
  }

  const { channels }: Props = $props()

  let limit = $state(100)

  let channelsPaginated = $derived(channels.slice(0, limit))

  $effect(() => {
    void search.query.length

    limit = 100
  })

  function showMore() {
    limit += 100
  }
</script>

<div class="flex flex-col bg-white dark:bg-primary-810 rounded-b-md">
  <div>
    <div class="w-full inline-block min-w-full align-middle">
      <div class="min-w-full w-full">
        {#each channelsPaginated as channel (channel.id)}
          <ChannelList.Item {channel} />
        {/each}
      </div>
    </div>
  </div>
  {#if channelsPaginated.length < channels.length}
    <button
      class="flex border-t border-gray-200 dark:border-primary-700 items-center justify-center h-12 w-full text-blue-500 dark:text-blue-400 hover:bg-gray-50 hover:dark:bg-primary-750 focus-visible:outline-0 cursor-pointer"
      onclick={showMore}>Show More</button
    >
  {/if}
</div>
