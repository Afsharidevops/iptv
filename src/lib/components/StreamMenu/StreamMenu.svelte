<script lang="ts">
  import { CopyLinkButton, Menu } from '$lib/components'
  import { toast } from '@zerodevx/svelte-toast'
  import type { SvelteComponent } from 'svelte'
  import type { Stream } from '$lib/types'

  interface Props {
    stream: Stream.Type
  }

  const { stream }: Props = $props()

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
  <CopyLinkButton url={stream.url} onCopy={onLinkCopy} />
  <Menu.Button url={stream.editUrl} label="Edit" iconName="Edit" external onClick={closeMenu} />
  <Menu.Button
    url={stream.reportUrl}
    label="Report"
    iconName="Alert"
    external
    onClick={closeMenu}
  />
</Menu>
