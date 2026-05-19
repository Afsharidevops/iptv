<script lang="ts">
  import { Modal, ChannelCard } from '$lib/components'
  import type { Channel } from '$lib/types'

  type Props = {
    channel: Channel.Type
    onClose: () => void
  }

  let { channel, onClose = () => {} }: Props = $props()
</script>

<Modal classWindow="pt-14">
  <ChannelCard {channel} {onClose} />
</Modal>
