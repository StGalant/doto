import { ref } from 'vue'
import { } from 'vue-i18n'

const show = ref(false)
const showContent = ref<any>(null)
const showRect = ref<null | DOMRect>(null)
const showOffset = ref(-8)

const showTooltip = (c: any, rect: DOMRect) => {
  showContent.value = typeof c === 'function' ? c.call() : t(c)
  show.value = true
  showRect.value = rect
}

const hideTooltip = () => {
  show.value = false
  showContent.value = false
  showRect.value = null
}

let timeoutCtrl: any
const waitToShow = (c: any, el: HTMLElement) => {
  timeoutCtrl = setTimeout(() => {
    timeoutCtrl = null
    const rect = el.getBoundingClientRect()
    showTooltip(c, rect)
  }, 250)
}

const cancelShow = () => {
  if (timeoutCtrl)
    clearTimeout(timeoutCtrl)
  hideTooltip()
}

export const vTooltip = {
  mounted(this: any, el: HTMLElement, bindings: any) {
    if (!bindings.value)
      return

    el.addEventListener('mouseenter', (ev: MouseEvent) => waitToShow(bindings.value, ev.target as HTMLElement))

    el.addEventListener('mouseleave', () => cancelShow())
  },
}

export const useTooltip = () => {
  return {
    show,
    showContent,
    showRect,
    showOffset,
  }
}
