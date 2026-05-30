<script lang="ts">
  import type { Logo } from '$lib/types'
  import * as Icon from '$lib/icons'

  interface Props {
    logo: Logo.Snippet
    onClick: () => void
  }

  const { logo, onClick = () => {} }: Props = $props()

  let isLoading = $state(true)

  $effect(() => {
    if (logo?.url) {
      isLoading = true
    }
  })
</script>

{#if logo}
  <div class="w-full justify-center items-center flex h-34 relative">
    {#if isLoading}
      <div
        class="absolute bottom-0 left-0 right-0 top-0 flex justify-center items-center z-50 text-gray-400 pointer-events-none"
      >
        <Icon.Spinner size={20} />
      </div>
    {/if}
    <button
      onclick={onClick}
      class="cursor-pointer h-34 w-full relative flex justify-center items-center"
      title="Logos"
    >
      <img
        src={logo.url}
        alt={`${logo.displayName} logo`}
        title={logo.url}
        referrerpolicy="no-referrer"
        onload={() => (isLoading = false)}
        onerror={() => (isLoading = false)}
        class="bg-gray-100 text-sm text-gray-400 dark:text-gray-600 rounded-sm overflow-hidden max-h-full"
        style:max-width={logo.width ? `${logo.width}px` : ''}
      />
    </button>
    <div class="absolute bottom-1 right-1 pointer-events-none">
      <Icon.Open size={20} class="text-gray-400" />
    </div>
  </div>
{/if}
