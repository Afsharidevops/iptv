<script lang="ts">
  import { Card, IconButton, LogoList } from '$lib/components'
  import type { Logo } from '$lib/types'
  import * as Icon from '$lib/icons'

  interface Props {
    logos: Logo.Type[]
    onClose?: () => void
    title?: string
    addLogoUrl: string
  }

  const { title = 'Logos', logos, addLogoUrl, onClose = () => {} }: Props = $props()
</script>

<Card>
  {#snippet headerLeft()}
    <div class="text-l font-medium text-gray-800 dark:text-white inline-flex items-center">
      <span
        class="inline-flex items-center pr-2 text-sm font-semibold text-gray-500 dark:text-gray-100 rounded-full"
      >
        <Icon.Images size={18} />
      </span>{title}
    </div>
  {/snippet}
  {#snippet headerRight()}
    <div class="inline-flex">
      <IconButton
        onClick={() => window.open(addLogoUrl, '_blank')}
        title="Add Logo"
        iconName="AddCircle"
        iconSize={20}
      />
      <IconButton onClick={onClose} iconName="Close" iconSize={20} title="Close" />
    </div>
  {/snippet}
  {#snippet body()}
    <div class="flex flex-col gap-2 p-2 sm:p-5 sm:pt-3">
      <LogoList {logos} />
    </div>
  {/snippet}
</Card>
