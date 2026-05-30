<script lang="ts">
  import type { Channel } from '$lib/types'
  import * as HistoryBlock from './'

  interface Props {
    group: Channel.HistoryGroup
  }

  const { group }: Props = $props()
</script>

<div class="pr-1 h-[168px]">
  <div class="h-full rounded-md border border-gray-200 dark:border-primary-700 flex">
    {#each group.items as item (item.key)}
      <HistoryBlock.Item {item} />
    {/each}
  </div>
</div>
