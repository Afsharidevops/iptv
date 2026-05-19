<script lang="ts">
  import { downloadMode } from '$lib/downloadMode.svelte'
  import type { ModalContext } from '$lib/modal.svelte'
  import { fade } from 'svelte/transition'
  import type { Feed } from '$lib/types'
  import { getContext } from 'svelte'
  import * as Icon from '$lib/icons'
  import { page } from '$app/state'
  import {
    StreamsCard,
    HTMLPreview,
    LogoPreview,
    GuidesCard,
    LogosCard,
    CodeBlock,
    FeedMenu,
    SelectButton,
    IconButton
  } from '$lib/components'

  interface Props {
    feed: Feed.Type
    onClose?: () => void
  }

  const { feed, onClose = () => {} }: Props = $props()

  const modal = getContext<ModalContext>('modal')

  function showLogos() {
    modal.open(LogosCard, {
      logos: feed.logos,
      addLogoUrl: feed.addLogoUrl,
      title: 'Logos',
      onClose: () => modal.close()
    })
  }

  function showGuides() {
    modal.open(GuidesCard, {
      guides: feed.guides,
      onClose: () => modal.close(),
      classWindowWrap: 'p-2 pt-16 sm:py-44'
    })
  }

  function showStreams() {
    modal.open(StreamsCard, {
      streams: feed.streams,
      addStreamUrl: feed.addStreamUrl,
      onClose: () => modal.close(),
      classWindowWrap: 'p-2 pt-16 sm:py-44'
    })
  }

  function getIsExpanded() {
    const hash = page.url.hash.replace('#', '')

    return (!hash && feed.isMain) || hash.toLowerCase() === feed.id.toLowerCase()
  }

  let isExpanded = $state(getIsExpanded())
  function toggleIsExpanded() {
    isExpanded = !isExpanded
  }
</script>

<div class="relative" class:pl-12={downloadMode.isEnabled}>
  <div
    transition:fade={{ duration: 200 }}
    class="w-12 h-14 shrink-0 flex items-center absolute left-0"
    class:opacity-0={!downloadMode.isEnabled}
    class:opacity-100={downloadMode.isEnabled}
    class:pointer-events-auto={downloadMode.isEnabled}
    class:pointer-events-none={!downloadMode.isEnabled}
  >
    <SelectButton streams={feed.streams} />
  </div>
  <div class="w-full rounded-md border border-gray-200 dark:border-gray-700" id={feed.id}>
    <div
      class="w-full inline-flex justify-between px-2 py-1.5 border-gray-200 dark:border-gray-700"
      class:border-b={isExpanded}
    >
      <div class="flex items-center w-full">
        <div class:rotate-180={isExpanded}>
          <IconButton
            onClick={toggleIsExpanded}
            size={32}
            title={isExpanded ? 'Collapse' : 'Expand'}
            iconName="Expand"
            iconSize={20}
          />
        </div>
        <div
          class="w-full text-gray-600 dark:text-white overflow-hidden pl-2 md:w-[260px] md:shrink-0"
        >
          <div class="truncate whitespace-nowrap">{feed.name}</div>
        </div>
        <div class="w-full hidden md:flex overflow-hidden">
          <CodeBlock>{feed.id}</CodeBlock>
        </div>
        <div class="text-right flex justify-end items-center w-[140px] shrink-0">
          <div class="flex space-x-5 items-center px-2 h-10">
            {#if feed.hasStreams}
              <button
                onclick={showStreams}
                class="text-sm text-gray-400 inline-flex space-x-1 flex items-center hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                title="Streams"
              >
                <Icon.Stream size={20} />
                <div>{feed.streamsCount}</div>
              </button>
            {/if}
            {#if feed.hasGuides}
              <button
                onclick={showGuides}
                class="text-sm text-gray-400 inline-flex space-x-1 flex items-center hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                title="Guides"
              >
                <Icon.Guide size={20} />
                <div>{feed.guidesCount}</div>
              </button>
            {/if}
          </div>
          <FeedMenu {feed} />
        </div>
      </div>
    </div>
    {#if isExpanded}
      <div class="w-full px-6 pt-5 pb-2 flex-col space-y-5">
        <LogoPreview logo={feed.mainLogo} onClick={() => showLogos()} />
        <HTMLPreview
          fieldset={feed.fieldset}
          onClick={() => {
            modal.close()
            onClose()
          }}
        />
      </div>
    {/if}
  </div>
</div>
