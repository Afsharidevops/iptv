<script lang="ts">
  import { afterNavigate, beforeNavigate, pushState, replaceState } from '$app/navigation'
  import { downloadMode } from '$lib/downloadMode.svelte'
  import { channelModal } from '$lib/channelModal.svelte'
  import { getContext, onMount, untrack } from 'svelte'
  import type { ModalContext } from '$lib/modal.svelte'
  import type { Channel, Country } from '$lib/types'
  import { DEFAULT_QUERY } from '$lib/constants'
  import { toast } from '@zerodevx/svelte-toast'
  import { search } from '$lib/search.svelte'
  import { url } from '$lib/url.svelte'
  import { unpack } from '$lib/utils'
  import { page } from '$app/state'
  import {
    SearchSyntaxCard,
    CountryList,
    SearchField,
    BottomBar,
    NavBar,
    ChannelModal
  } from '$lib/components'

  const modal = getContext<ModalContext>('modal')

  let isLoading = $state(true)
  let countries: Country.Type[] = $state([])
  let channels: Channel.Stub[] = $state([])

  onMount(async () => {
    try {
      const [countriesBuffer, channelStubsBuffer] = await Promise.all([
        fetch('/data/countries.msgpack').then(res => res.arrayBuffer()),
        fetch('/data/channelStubs.msgpack').then(res => res.arrayBuffer())
      ])

      countries = unpack(countriesBuffer)
      channels = unpack(channelStubsBuffer)

      search.init()
      downloadMode.init()
    } catch (error) {
      toast.push(error.message)
    }
  })

  beforeNavigate(({ type }) => {
    if (type === 'popstate') {
      search.isSearching = true
    }
  })

  afterNavigate(() => {
    const q = page.url.searchParams.get('q')
    search.query = typeof q === 'string' ? decodeURIComponent(q) : DEFAULT_QUERY + ' '
    search.submit()
  })

  $effect(() => {
    channelModal.updateChannel(page.state?.channelId)
  })

  $effect(() => {
    const isSearchReady = search.isReady
    isLoading = !isSearchReady
  })

  function showSearchSyntax(event: MouseEvent) {
    event.preventDefault()
    modal.open(SearchSyntaxCard, { onClose: () => modal.close() })
  }

  let searchField: SearchField
  function focusOnSearchField() {
    if (searchField) searchField.focus()
  }

  let scrollY = $state(0)

  const isSpinnerActive = $derived(isLoading || search.isSearching)

  const channelGroups = $derived.by(() => {
    void search.searchResults.size
    const hasQuery = untrack(() => !!search.query)

    if (!hasQuery) return Object.groupBy(channels, channel => channel.countryCode)

    const groups = {}
    for (const channel of channels) {
      if (!search.searchResults.size) break
      if (!search.searchResults.has(channel.id)) continue

      if (!groups[channel.countryCode]) {
        groups[channel.countryCode] = []
      }

      groups[channel.countryCode].push(channel)
    }

    return groups
  })

  const countriesDisplay = $derived.by(() => {
    const currentGroups = channelGroups
    const query = untrack(() => search.query)
    const hasQuery = !!query && query.trim() !== DEFAULT_QUERY

    const results = []
    for (const country of countries) {
      const isExpanded = hasQuery && !!currentGroups[country.code]

      results.push({
        ...country,
        isExpanded
      })
    }

    return results
  })

  function closeChannelModal() {
    if (channelModal.originUrl) {
      pushState(channelModal.originUrl, {})
      channelModal.originUrl = null
    } else {
      replaceState('/', {})
    }
    channelModal.currentChannel = null
  }

  $effect(() => {
    const channel = channelModal.currentChannel

    untrack(() => {
      if (channel) {
        modal.open(
          ChannelModal,
          { channel, onClose: closeChannelModal },
          { onClose: closeChannelModal }
        )
      } else {
        modal.close()
      }
    })
  })
</script>

<svelte:window bind:scrollY />
<svelte:head>
  {#if channelModal.currentChannel}
    <title>{channelModal.currentChannel.uniqueName} · iptv-org</title>
  {:else}
    <title>iptv-org</title>
  {/if}
  <meta name="description" content="iptv-org is user editable database for TV channels" />
  <link rel="canonical" href="https://iptv-org.github.io/" />
</svelte:head>

<header
  class:absolute={scrollY <= 150}
  class:sticky={scrollY > 150}
  class="z-20 left-0 right-0 min-w-[360px] flex items-center"
  style="top: {scrollY > 150 && scrollY <= 210 ? scrollY - 210 : 0}px"
>
  <NavBar onSearchButtonClick={focusOnSearchField} />
</header>

<main class="bg-slate-50 dark:bg-primary-850 min-h-screen min-w-[360px]">
  <section class="max-w-[960px] mx-auto px-2 pt-16 sm:pt-20 pb-20 overflow-hidden min-h-full">
    <SearchField
      bind:this={searchField}
      onSubmit={() => {
        url.setSearchParam(search.query)
      }}
      onClear={() => {
        search.query = ''
        focusOnSearchField()
      }}
    />
    <div class="pt-2 pb-6 flex justify-between px-1">
      <span class="inline-flex text-sm text-gray-500 dark:text-gray-400 font-mono pt-0.5"
        >Found&nbsp;
        <span class:animate-spin={isSpinnerActive}
          >{isSpinnerActive ? '/' : search.searchResults.size.toLocaleString()}</span
        >
        &nbsp;channel(s)</span
      >
      <button
        type="button"
        onclick={showSearchSyntax}
        class="inline-flex text-sm text-gray-500 dark:text-gray-400 font-mono hover:underline hover:text-blue-500 dark:hover:text-blue-400 pt-0.5 cursor-pointer"
      >
        Search syntax
      </button>
    </div>
    {#if isLoading}
      <div
        class="flex items-center justify-center w-full pt-1 pb-6 tracking-tight text-sm text-gray-500 dark:text-gray-400 font-mono"
      >
        loading...
      </div>
    {:else}
      <CountryList countries={countriesDisplay} {channelGroups} />
    {/if}
  </section>
</main>

{#if downloadMode.isEnabled}
  <BottomBar />
{/if}
