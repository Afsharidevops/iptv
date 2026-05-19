<script lang="ts">
  import { downloadMode } from '$lib/downloadMode.svelte'
  import { Checkbox } from '$lib/components'
  import type { Stream } from '$lib/types'

  interface Props {
    streams: Stream.Snippet[]
  }

  const { streams }: Props = $props()

  const state = $derived(downloadMode.getSelectionState(streams))

  function handleChange(checked: boolean) {
    if (checked) {
      downloadMode.selectStreams(state.active)
    } else {
      downloadMode.deselectStreams(state.active)
    }
  }
</script>

<Checkbox
  selected={state.isSelected}
  indeterminate={state.isIndeterminate}
  disabled={state.isDisabled}
  onChange={handleChange}
/>
