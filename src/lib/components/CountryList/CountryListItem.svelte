<script lang="ts">
  import { ChannelList, SelectButton } from '$lib/components'
  import { downloadMode } from '$lib/downloadMode.svelte'
  import type { Country, Channel } from '$lib/types'
  import { fade } from 'svelte/transition'
  import * as Icon from '$lib/icons'

  interface Props {
    country: Country.Type
    channels?: Channel.Stub[]
  }

  const { country, channels = [] }: Props = $props()

  let isExpanded = $state(false)

  function toggleExpanded() {
    isExpanded = !isExpanded
  }

  $effect(() => {
    const _isEpanded = country.isExpanded

    isExpanded = _isEpanded
  })
</script>

{#if channels.length}
  <div
    class="mb-2 md:mb-3"
    class:pl-14={downloadMode.isEnabled}
    style="transition: padding-left 100ms"
  >
    <div id="accordion-heading-{country.code}" class="flex relative">
      <div
        transition:fade={{ duration: 200 }}
        class="w-12 h-13 shrink-0 flex items-center absolute -left-14"
        class:opacity-0={!downloadMode.isEnabled}
        class:opacity-100={downloadMode.isEnabled}
      >
        <SelectButton streams={country.streams} />
      </div>
      <button
        onclick={toggleExpanded}
        type="button"
        class="flex items-center focus:ring-0 focus:outline-none dark:focus:ring-gray-800 justify-between h-13 pl-3.5 pr-4 w-full font-medium text-left border border-gray-200 dark:border-primary-750 text-gray-500 dark:text-white bg-white dark:bg-primary-810 cursor-pointer"
        class:rounded-t-md={isExpanded}
        class:rounded-md={!isExpanded}
        class:border-b-transparent={isExpanded}
        class:dark:border-b-transparent={isExpanded}
        aria-expanded={isExpanded}
      >
        <span class="flex items-center space-x-2"
          ><span class="w-4">{@html country.flag}</span><span>{country.name}</span></span
        >
        <div class="text-gray-400" class:rotate-180={isExpanded}>
          <Icon.Expand size={20} />
        </div>
      </button>
    </div>
    {#if isExpanded}
      <div
        class="relative"
        id="accordion-body-{country.code}"
        aria-labelledby="accordion-heading-{country.code}"
      >
        <div class="border border-gray-200 dark:border-primary-750 rounded-b-md">
          <ChannelList {channels} />
        </div>
      </div>
    {/if}
  </div>
{/if}
