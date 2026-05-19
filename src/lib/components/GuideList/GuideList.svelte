<script lang="ts">
  import * as GuideList from './'

  interface Props {
    guides
  }

  const { guides }: Props = $props()
</script>

{#each guides as guide (guide.hash)}
  <GuideList.Item {guide} />
{/each}
