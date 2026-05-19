<script lang="ts">
  import { Card, FeedList, IconButton, Modal } from '$lib/components'
  import type { Feed } from '$lib/types'
  import * as Icon from '$lib/icons'

  interface Props {
    variant?: string
    feeds: Feed.Type[]
    title?: string
    addFeedUrl: string
    onClose?: () => void
  }

  const {
    variant = 'default',
    title = 'Feeds',
    addFeedUrl,
    feeds,
    onClose = () => {}
  }: Props = $props()
</script>

<Card border={variant === 'channelPage'}>
  {#snippet headerLeft()}
    <div class="text-l font-medium text-gray-800 dark:text-white inline-flex items-center">
      <span
        class="inline-flex items-center pr-2 text-sm font-semibold text-gray-500 dark:text-gray-100 rounded-full"
      >
        <Icon.Feed size={21} />
      </span>{title}
    </div>
  {/snippet}
  {#snippet headerRight()}
    <div class="inline-flex">
      <IconButton
        onClick={() => {
          window.open(addFeedUrl, '_blank')
        }}
        title="Add Feed"
        iconName="AddCircle"
        iconSize={20}
      />
      {#if variant === 'default'}
        <IconButton onClick={onClose} iconName="Close" iconSize={20} title="Close" />
      {/if}
    </div>
  {/snippet}
  {#snippet body()}
    <div class="flex flex-col gap-2 p-2 sm:p-5">
      <Modal classWindow="pt-14">
        <FeedList {feeds} {onClose} />
      </Modal>
    </div>
  {/snippet}
</Card>
