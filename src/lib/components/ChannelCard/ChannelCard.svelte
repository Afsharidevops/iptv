<script lang="ts">
  import type { ModalContext } from '$lib/modal.svelte'
  import type { Channel, Logo } from '$lib/types'
  import { toast } from '@zerodevx/svelte-toast'
  import { getContext } from 'svelte'
  import { unpack } from '$lib/utils'
  import { withBase } from '$lib/withBase'
  import * as ChannelCard from './'
  import {
    BlockedBadge,
    HTMLPreview,
    ClosedBadge,
    LogoPreview,
    ChannelMenu,
    LogosCard,
    Card,
    IconButton
  } from '$lib/components'

  interface Props {
    variant?: string
    onClose?: () => void
    channel: Channel.Type
  }

  const { variant = 'default', channel, onClose = () => {} }: Props = $props()

  const isTouchDevice =
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

  const modal = getContext<ModalContext>('modal')

  async function showLogos() {
    try {
      const logosBuffer = await fetch(withBase(channel.logosPath)).then(res => res.arrayBuffer())

      const logos = unpack<Logo.Type>(logosBuffer)

      modal.open(LogosCard, {
        logos,
        addLogoUrl: channel.addLogoUrl,
        title: 'Logos',
        onClose: () => modal.close()
      })
    } catch (error) {
      toast.push(error.message)
    }
  }

  async function share() {
    if (navigator.canShare) {
      try {
        navigator.share({
          title: channel.uniqueName,
          url: channel.pageUrl
        })
      } catch (error) {
        toast.push(error.message)
      }
    }
  }
</script>

<Card border={variant === 'channelPage'}>
  {#snippet headerLeft()}
    <div>
      <div class="text-l font-medium text-gray-900 dark:text-white sm:pl-1 space-x-1">
        <span>{channel.uniqueName}</span>
        {#if channel.isClosed}
          <ClosedBadge {channel} />
        {/if}
        {#if channel.isBlocked}
          <BlockedBadge {channel} />
        {/if}
      </div>
    </div>
  {/snippet}
  {#snippet headerRight()}
    <div class="inline-flex w-30 shrink-0 items-center justify-end">
      {#if isTouchDevice}
        <IconButton onClick={share} iconName="Share" iconSize={18} title="Share" />
      {/if}
      <ChannelMenu {channel} />
      {#if variant === 'default'}
        <IconButton onClick={onClose} iconName="Close" iconSize={20} title="Close" />
      {/if}
    </div>
  {/snippet}
  {#snippet body()}
    <div class="pt-3 sm:pt-6 pb-4 sm:pb-7 px-3 sm:px-9 space-y-2">
      <div class="px-1 space-y-5">
        <LogoPreview logo={channel.mainLogo} onClick={() => showLogos()} />
        <HTMLPreview fieldset={channel.fieldset} />
      </div>

      {#if channel.hasHistory}
        <ChannelCard.HistoryBlock {channel} />
      {/if}
    </div>
  {/snippet}
</Card>
