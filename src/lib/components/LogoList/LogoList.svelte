<script lang="ts">
  import type { Logo } from '$lib/types'
  import * as LogoList from './'

  interface Props {
    logos: Logo.Type[]
  }

  const { logos }: Props = $props()
</script>

{#each logos as logo (logo.url)}
  <LogoList.Item {logo} />
{/each}
