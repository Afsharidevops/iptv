<script lang="ts">
  import type { BlocklistRecord, Channel } from '$lib/types'
  import { Badge } from '$lib/components'
  import { tippy } from '$lib/actions'

  interface Props {
    channel: Channel.Type | Channel.Stub
  }

  let { channel }: Props = $props()

  const primaryReason = $derived.by(() => {
    let reason = 'dmca'
    channel.blocklistRecords.forEach(record => (reason = record.reason))

    return reason
  })

  const refs = $derived.by(() => {
    return channel.blocklistRecords
      .map((record: BlocklistRecord.Type) => {
        return `<a class="underline" target="_blank" rel="noreferrer" href="${
          record.ref
        }">${record.refLabel}</a>`
      })
      .join(', ')
  })

  const message = $derived.by(() => {
    if (primaryReason === 'dmca') {
      return `The channel has been added to our blocklist due to the claims of the copyright holder: ${refs}`
    } else if (primaryReason === 'nsfw') {
      return `The channel has been added to our blocklist due to NSFW content: ${refs}`
    } else {
      return ''
    }
  })
</script>

<Badge>
  <div
    use:tippy={{
      content: message
    }}
  >
    Blocked
  </div>
</Badge>
