import type { Stream } from '.'

export type Type = {
  code: string
  name: string
  languages: string[]
  hasStreams?: boolean
  streams?: Stream.Snippet[]
  isExpanded?: boolean
  flag?: string
}
