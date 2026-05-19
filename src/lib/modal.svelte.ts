export class ModalContext {
  isOpen = $state(false)
  component = $state(null)
  props = $state({})
  callbacks = $state({
    onClose: () => {},
    onClosed: () => {},
    onOpen: () => {},
    onOpened: () => {}
  })

  open(component, props = {}, callbacks = {}) {
    this.callbacks = { ...this.callbacks, ...callbacks }
    if (typeof this.callbacks.onOpen === 'function') this.callbacks.onOpen()
    this.component = component
    this.props = props
    this.isOpen = true
    if (typeof this.callbacks.onOpened === 'function') this.callbacks.onOpened()
  }

  close(callbacks = {}) {
    this.callbacks = { ...this.callbacks, ...callbacks }
    if (typeof this.callbacks.onClose === 'function') this.callbacks.onClose()
    this.isOpen = false
    this.component = null
    if (typeof this.callbacks.onClosed === 'function') this.callbacks.onClosed()
  }
}

export const MODAL_KEY = 'modal'
