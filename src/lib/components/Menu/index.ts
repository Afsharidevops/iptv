import MenuRoot from './Menu.svelte'
import MenuButton from './MenuButton.svelte'

export const Menu = Object.assign(MenuRoot, {
  Button: MenuButton
}) as typeof MenuRoot & { Button: typeof MenuButton }
