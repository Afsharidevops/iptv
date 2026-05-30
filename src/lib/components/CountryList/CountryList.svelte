<script lang="ts">
  import type { Country, Channel } from '$lib/types'
  import * as CountryList from './'

  interface Props {
    countries: Country.Type[]
    channelGroups: Record<string, Channel.Stub[]>
  }

  const { countries, channelGroups }: Props = $props()
</script>

{#each countries as country (country.code)}
  {#if channelGroups[country.code]}
    <CountryList.Item {country} channels={channelGroups[country.code]} />
  {/if}
{/each}
