<script lang="ts">
  import { SvelteToast } from '@zerodevx/svelte-toast'
  import { Modal } from '$lib/components'
  import type { Snippet } from 'svelte'
  import '../app.css'

  interface Props {
    children?: Snippet
  }

  let { children }: Props = $props()

  const toastOptions = {
    duration: 5000,
    reversed: true,
    intro: { x: -192 },
    dismissable: false,
    classes: ['custom']
  }
</script>

<svelte:head>
  <script>
    if (document) {
      const prefersColorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      const mode = localStorage.theme || prefersColorScheme
      if (mode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  </script>
</svelte:head>

<Modal>
  {@render children?.()}
</Modal>

<div class="text-sm">
  <SvelteToast options={toastOptions} />
</div>

<style>
  :root {
    --toastContainerTop: auto;
    --toastContainerRight: auto;
    --toastContainerBottom: 2rem;
    --toastContainerLeft: 1rem;
  }

  :global(.custom) {
    --toastMinHeight: auto;
    --toastBackground: #1e232f;
    --toastMsgPadding: 12px 12px;
    --toastBarHeight: 0;
    --toastBorderRadius: 0.375rem;
  }
</style>
