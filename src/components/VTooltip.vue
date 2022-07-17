<script lang="ts" setup>
import { computed } from 'vue'
import { useTooltip } from '~/composables/useTooltip'

const { show, showContent, showRect, showOffset } = useTooltip()

const tooltipPosition = computed(() => {
  if (!showRect.value)
    return { top: '-1000px' }

  const offsetFrom = showOffset.value > 0 ? 'top' : 'bottom'
  const offset = showOffset.value > 0
    ? `${showRect.value.bottom - showOffset.value}px`
    : `${window.innerHeight - showRect.value.top - showOffset.value}px`

  return {
    left: `${showRect.value.left}px`,
    // maxWidth: `${showRect.value.width}px`,
    width: `${showRect.value.width}px`,
    [offsetFrom]: offset,
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition>
      <div v-show="show" class="fixed flex justify-center" :style="tooltipPosition">
        <div class="VTooltip">
          {{ showContent }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.VTooltip {
  padding: .5rem;
  background-color: var(--color-tooltip-bg, hsl(0, 0%, 85%));
  border: 1px solid var(--color-tooltip-border, hsl(0, 0%, 75%));
  border-radius: .25rem;
  font-size: var(--fs-tooltip, .85rem);
  color: var(--color-tooltip, hsl(0, 0%, 10%));
  z-index: var(--z-tooltip, 1000);
  white-space: pre;
}
</style>
