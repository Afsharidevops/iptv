<script lang="ts">
  import { GuideList, Card, IconButton } from '$lib/components'
  import type { Guide } from '$lib/types'
  import * as Icon from '$lib/icons'

  interface Props {
    guides: Guide.Type[]
    onClose?: () => void
  }

  const { guides, onClose = () => {} }: Props = $props()
</script>

<Card>
  {#snippet headerLeft()}
    <div class="text-l font-medium text-gray-800 dark:text-white inline-flex items-center">
      <span
        class="inline-flex items-center pr-2 text-sm font-semibold text-gray-500 dark:text-gray-100 rounded-full"
      >
        <Icon.Guide size={20} />
      </span>
      <span>Guides</span>
    </div>
  {/snippet}
  {#snippet headerRight()}
    <div>
      <IconButton onClick={onClose} iconName="Close" iconSize={20} title="Close" />
    </div>
  {/snippet}
  {#snippet body()}
    <div class="p-2 sm:p-5 w-full">
      <div class="dark:border-gray-700 rounded-md border border-gray-200">
        <GuideList {guides} />
      </div>
    </div>
  {/snippet}
</Card>
