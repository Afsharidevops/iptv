<script lang="ts">
  import type { Channel } from '$lib/types'
  import { Badge } from '$lib/components'
  import { tippy } from '$lib/actions'

  interface Props {
    channel: Channel.Type | Channel.Stub
  }

  let { channel }: Props = $props()

  const message = $derived.by(() => {
    return channel.closed ? `closed: ${channel.closed}` : ''
  })
</script>

<Badge>
  <div
    use:tippy={{
      content: message
    }}
  >
    Closed
  </div>
</Badge>
