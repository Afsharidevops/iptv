<script lang="ts">
  import type { Feed, Channel } from '$lib/types'
  import * as LogoList from './'

  interface Props {
    logos: (Feed.Logo | Channel.Logo)[]
  }

  const { logos }: Props = $props()
</script>

{#each logos as logo (logo.url)}
  <LogoList.Item {logo} />
{/each}
