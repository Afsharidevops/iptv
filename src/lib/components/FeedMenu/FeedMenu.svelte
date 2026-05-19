<script lang="ts">
  import { CopyLinkButton, Menu } from '$lib/components'
  import { toast } from '@zerodevx/svelte-toast'
  import type { SvelteComponent } from 'svelte'
  import type { Feed } from '$lib/types'

  interface Props {
    feed: Feed.Type
  }

  const { feed }: Props = $props()

  let menu: SvelteComponent
  function closeMenu() {
    if (menu) menu.close()
  }

  function onLinkCopy() {
    toast.push('Link copied to clipboard')
    closeMenu()
  }
</script>

<Menu bind:this={menu}>
  <CopyLinkButton url={feed.pageUrl} onCopy={onLinkCopy} />
  {#if !feed.hasLogos}
    <Menu.Button
      url={feed.addLogoUrl}
      label="Add Logo"
      iconName="Image"
      external
      onClick={closeMenu}
    />
  {/if}
  {#if !feed.hasStreams && !feed.isBlocked && !feed.isClosed}
    <Menu.Button
      url={feed.addStreamUrl}
      label="Add Stream"
      iconName="Stream"
      external
      onClick={closeMenu}
    />
  {/if}
  {#if !feed.hasStreams && !feed.isBlocked && !feed.isClosed}
    <Menu.Button
      url={feed.requestLinkUrl}
      label="Request Stream"
      iconName="Request"
      external
      onClick={closeMenu}
    />
  {/if}
  <Menu.Button url={feed.editUrl} label="Edit" iconName="Edit" external onClick={closeMenu} />
  <Menu.Button url={feed.removeUrl} label="Remove" iconName="Remove" external onClick={closeMenu} />
</Menu>
