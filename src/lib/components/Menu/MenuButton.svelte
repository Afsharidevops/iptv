<script lang="ts">
  import { Button } from '$lib/components'
  import * as Icon from '$lib/icons'

  interface Props {
    url: string
    label: string
    iconName: string
    external?: boolean
    onClick?: () => void
  }

  const { url, label, iconName, external = false, onClick = () => {} }: Props = $props()

  function getIconName() {
    return iconName
  }

  const LeadingIcon = Icon[getIconName()]

  function _onClick() {
    window.open(url, '_blank')
    onClick()
  }
</script>

<Button onClick={_onClick} {label}>
  {#snippet left()}
    <LeadingIcon class="text-gray-400" size={16} />
  {/snippet}
  {#snippet right()}
    {#if external}
      <Icon.ExternalLink class="text-gray-400 dark:text-gray-500" size={17} />
    {/if}
  {/snippet}
</Button>
