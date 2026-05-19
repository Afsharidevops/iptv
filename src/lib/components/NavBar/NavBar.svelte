<script lang="ts">
  import { SearchField, IconButton } from '$lib/components'
  import { downloadMode } from '$lib/downloadMode.svelte'
  import { darkMode } from '$lib/darkMode.svelte'
  import { search } from '$lib/search.svelte'
  import { goto } from '$app/navigation'
  import { url } from '$lib/url.svelte'
  import { resolve } from '$app/paths'
  import { onMount } from 'svelte'
  import * as NavBar from './'

  const { version = 'default', onSearchButtonClick = () => {} } = $props()

  let scrollY = $state(0)

  function scrollToTop() {
    document.body.scrollIntoView()
  }

  let searchField: SearchField = $state()
  function focusOnInput() {
    if (searchField) searchField.focus()
  }

  function clearQuery() {
    search.query = ''
    focusOnInput()
  }

  function gotoHomePage(event: MouseEvent) {
    event.preventDefault()
    goto(resolve('/'))
  }

  function openGitHub() {
    window.open('https://github.com/iptv-org/', '_blank', 'noreferrer')
  }

  onMount(() => {
    darkMode.init()
  })
</script>

<svelte:window bind:scrollY />

{#if version === 'default'}
  <nav
    class="py-2.5 w-full h-[61px] bg-[#f8fafc] dark:bg-primary-850 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    class:border-b={scrollY > 0}
  >
    <div class="flex justify-between items-center mx-auto px-3 w-full max-w-7xl">
      <div class="flex flex-start items-center sm:basis-120 shrink">
        <a href={resolve('/')} class="pr-2" onclick={gotoHomePage}>
          <NavBar.Logo />
        </a>
        <div class="hidden sm:block w-full">
          {#if scrollY > 150}
            <SearchField
              version="mini"
              bind:this={searchField}
              onClear={clearQuery}
              onSubmit={() => {
                url.setSearchParam(search.query)
              }}
            />
          {/if}
        </div>
      </div>

      <div class="inline-flex sm:space-x-1">
        {#if scrollY > 150}
          <div class="block sm:hidden">
            <IconButton
              onClick={() => {
                scrollToTop()
                onSearchButtonClick()
              }}
              title="Go to search"
              iconName="Search"
              iconSize={20}
            />
          </div>
        {/if}
        <IconButton
          onClick={() => downloadMode.toggle()}
          title="Create playlist"
          iconName="CreatePlaylist"
          iconSize={20}
        />
        <IconButton
          onClick={() => darkMode.toggle()}
          title="Toggle Dark Mode"
          iconName={darkMode.isActive ? 'LightMode' : 'DarkMode'}
          iconSize={20}
        />
        <IconButton onClick={openGitHub} title="GitHub" iconName="GitHub" iconSize={20} />
      </div>
    </div>
  </nav>
{:else if version === 'channelPage'}
  <nav
    class="py-2.5 w-full h-[61px] bg-[#f8fafc] dark:bg-primary-850 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    class:border-b={scrollY > 0}
  >
    <div class="flex justify-between items-center mx-auto px-3 w-full max-w-7xl">
      <div class="flex flex-start items-center sm:basis-120 shrink">
        <a href={resolve('/')} class="pr-2">
          <NavBar.Logo />
        </a>
        <div class="hidden sm:block w-full">
          <SearchField
            version="mini"
            onClear={clearQuery}
            onSubmit={() => {
              goto(`${resolve('/')}?q=${encodeURIComponent(search.query)}`)
            }}
          />
        </div>
      </div>

      <div class="inline-flex sm:space-x-1">
        <div class="block sm:hidden">
          <IconButton
            onClick={() => {
              goto(resolve('/'))
            }}
            title="Go to search"
            iconName="Search"
            iconSize={20}
          />
        </div>
        <IconButton
          onClick={() => darkMode.toggle()}
          title="Toggle Dark Mode"
          iconName={darkMode.isActive ? 'LightMode' : 'DarkMode'}
          iconSize={20}
        />
        <IconButton onClick={openGitHub} title="GitHub" iconName="GitHub" iconSize={20} />
      </div>
    </div>
  </nav>
{/if}
