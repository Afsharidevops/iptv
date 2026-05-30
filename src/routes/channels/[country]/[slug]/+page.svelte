<script lang="ts">
  import { NavBar, FeedsCard, ChannelCard } from '$lib/components'
  import type { Channel, Feed } from '$lib/types'

  type Props = {
    data: {
      channel: Channel.Type
      feeds: Feed.Type[]
    }
  }

  const { data }: Props = $props()

  const channel = $derived(data.channel)
  const feeds = $derived(data.feeds)
</script>

<svelte:head>
  <title>{`${channel.uniqueName} • iptv-org`}</title>
  <meta name="description" content={`Detailed description of ${channel.uniqueName}.`} />

  <!-- eslint-disable-next-line no-useless-escape -->
  {@html `<script type="application/ld+json">${JSON.stringify(channel.structuredData)}<\/script>`}
</svelte:head>

<header class="sticky z-40 top-0 left-0 right-0 min-w-[360px]">
  <NavBar version="channelPage" />
</header>

<main class="bg-slate-50 dark:bg-primary-850 min-h-screen min-w-[360px]">
  <section class="container max-w-3xl mx-auto px-2 pt-1 sm:pt-6 pb-20 flex-col space-y-4">
    <ChannelCard {channel} variant="channelPage" />
    <FeedsCard {feeds} addFeedUrl={channel.addFeedUrl} variant="channelPage" />
  </section>
</main>
