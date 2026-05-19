<script lang="ts">
  import type { SvelteComponent } from 'svelte'
  import type { Logo } from '$lib/types'
  import { Menu } from '$lib/components'

  interface Props {
    logo: Logo.Type
  }

  const { logo }: Props = $props()

  let menu: SvelteComponent
  function closeMenu() {
    if (menu) menu.close()
  }
</script>

<Menu bind:this={menu} variant="overlay">
  <Menu.Button url={logo.editUrl} label="Edit" iconName="Edit" external onClick={closeMenu} />
  <Menu.Button url={logo.removeUrl} label="Remove" iconName="Remove" external onClick={closeMenu} />
</Menu>
