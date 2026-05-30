<script lang="ts">
  import type { Feed } from '$lib/types'
  import * as FeedList from './'

  interface Props {
    feeds: Feed.Type[]
    onClose?: () => void
  }

  const { feeds, onClose = () => {} }: Props = $props()
</script>

{#each feeds as feed (feed.streamId)}
  <FeedList.Item {feed} {onClose} />
{/each}
