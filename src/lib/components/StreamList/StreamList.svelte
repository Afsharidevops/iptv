<script lang="ts">
  import type { Stream } from '$lib/types'
  import * as StreamList from './'

  interface Props {
    streams: Stream.Type[]
  }

  const { streams }: Props = $props()
</script>

{#each streams as stream (stream.hash)}
  <StreamList.Item {stream} />
{/each}
