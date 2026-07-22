<script lang="ts">
  import { scrollToSelected } from '$lib/actions'
  import type { Channel } from '$lib/types'
  import * as Icon from '$lib/icons'
  import { page } from '$app/state'
  import { pushState } from '$app/navigation'
  import { resolve } from '$app/paths'

  interface Props {
    item: Channel.HistoryItem
    isSelected?: boolean
  }

  const { item, isSelected = false }: Props = $props()

  const channel = $derived(item.channel)

  function getChannelPath() {
    const [channelSlug, countryCode] = channel.id.split('.')

    return resolve('/channels/[country]/[slug]', {
      country: countryCode,
      slug: channelSlug
    })
  }

  function onClick(event: MouseEvent) {
    if (page.route.id !== '/') return

    event.preventDefault()

    if (!isSelected) {
      openChannel()
    }
  }

  function openChannel() {
    pushState(getChannelPath(), {
      channelId: channel.id
    })
  }
</script>

<a
  class="p-2.5 rounded-md cursor-pointer"
  class:selected={isSelected}
  onclick={onClick}
  href={getChannelPath()}
  data-sveltekit-reload={page.route.id !== '/'}
  tabindex="0"
  title={channel.uniqueName}
  id={channel.id}
  use:scrollToSelected={isSelected}
>
  <div class="flex-col space-y-2 justify-start h-full">
    <div
      class="flex w-25 h-25 rounded-md justify-center items-center bg-gray-100 text-sm text-gray-400 dark:text-gray-600 overflow-hidden"
    >
      {#if channel.mainLogoUrl}
        <img
          class="max-w-20 max-h-20 mx-auto text-sm text-gray-400 dark:text-gray-600 rounded-xs"
          src={channel.mainLogoUrl}
          alt={channel.uniqueName}
          loading="lazy"
          referrerpolicy="no-referrer"
        />
      {:else}
        <Icon.NoImage size={30} class="text-gray-400" />
      {/if}
    </div>

    <div class="text-sm overflow-hidden w-25 text-left">
      <div class="truncate text-gray-900 dark:text-gray-100">
        {channel.uniqueName}
      </div>

      {#if channel.launchedYear || channel.closedYear}
        <div class="flex space-x-[2px] truncate text-gray-400">
          {#if channel.launchedYear}
            <div>{channel.launchedYear}</div>
          {:else}
            <div>?</div>
          {/if}

          {#if channel.closedYear}
            <div>-</div>
            <div>{channel.closedYear}</div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</a>

<style lang="postcss">
  @reference "../../../../app.css";

  .selected {
    @apply bg-gray-100 dark:bg-primary-750 cursor-default;
  }
</style>
