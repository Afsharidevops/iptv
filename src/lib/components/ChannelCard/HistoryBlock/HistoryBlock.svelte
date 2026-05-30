<script lang="ts">
  import type { Channel } from '$lib/types'
  import * as HistoryBlock from './'

  interface Props {
    channel: Channel.Type
  }

  const { channel }: Props = $props()
</script>

<div
  class="overflow-x-auto flex border-t border-gray-200 dark:border-primary-700 py-4 space-x-[2px]"
>
  {#each channel.history as historyItem (historyItem.key)}
    {#if historyItem.type === 'group'}
      {@const group = historyItem as Channel.HistoryGroup}
      <HistoryBlock.Group {group} />
    {:else if historyItem.type === 'channel'}
      {@const item = historyItem as Channel.HistoryItem}
      <HistoryBlock.Item {item} isSelected={item.channel.id === channel.id} />
    {/if}
  {/each}
</div>
