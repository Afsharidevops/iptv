<script lang="ts">
  import { IconButton, StreamList, Card } from '$lib/components'
  import type { Stream } from '$lib/types'
  import * as Icon from '$lib/icons'

  interface Props {
    streams: Stream.Type[]
    addStreamUrl: string
    onClose?: () => void
  }

  const { streams, addStreamUrl, onClose = () => {} }: Props = $props()
</script>

<Card>
  {#snippet headerLeft()}
    <div class="text-l font-medium text-gray-800 dark:text-white inline-flex items-center">
      <span
        class="inline-flex items-center pr-2 text-sm font-semibold text-gray-500 dark:text-gray-100 rounded-full"
      >
        <Icon.Stream size={21} />
      </span><span>Streams</span>
    </div>
  {/snippet}
  {#snippet headerRight()}
    <div class="inline-flex">
      <IconButton
        onClick={() => window.open(addStreamUrl, '_blank')}
        title="Add Stream"
        iconName="AddCircle"
        iconSize={20}
      />
      <IconButton onClick={onClose} iconName="Close" iconSize={20} title="Close" />
    </div>
  {/snippet}
  {#snippet body()}
    <div class="flex flex-col gap-2 p-2 sm:p-5">
      <StreamList {streams} />
    </div>
  {/snippet}
</Card>
