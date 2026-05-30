import { Unpackr, unpackMultiple } from 'msgpackr'
import dayjs from 'dayjs'

export function getYear(date: string): string | null {
  return date ? dayjs(date).format('YYYY') : null
}

export function pluralize(number: number, word: string) {
  return number > 1 ? word + 's' : word
}

export function normalize(value: string) {
  if (typeof value !== 'string') return ''

  value = value.includes(' ') ? `"${value}"` : value

  return encodeURIComponent(value)
}

export function unpack<Type>(arrayBuffer: ArrayBuffer | Uint8Array): Type[] {
  const cleanView =
    arrayBuffer instanceof Uint8Array
      ? arrayBuffer
      : new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength)

  return unpackMultiple(cleanView)
}

export function unpackObject<Type>(arrayBuffer: ArrayBuffer | Uint8Array): Type {
  const cleanView =
    arrayBuffer instanceof Uint8Array
      ? arrayBuffer
      : new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength)

  const unpackr = new Unpackr()
  return unpackr.unpack(cleanView)
}
