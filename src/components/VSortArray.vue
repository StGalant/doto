<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(defineProps<{ items: any[]; direction?: 'row' | 'col' }>(), {
  direction: 'row',
})
const emit = defineEmits(['update:item'])

const wrapper = ref(null as unknown as Element)
const itemMoved = ref<number | null>(null)

const onMouseDown = (index: number) => {
  itemMoved.value = index
}

const onMouseMove = (ev: MouseEvent) => {
  if (itemMoved.value !== null) {
    const { x, y, height, width } = wrapper.value.getBoundingClientRect()
    let w, m, s
    if (props.direction === 'row') {
      w = width
      m = ev.clientX
      s = x
    }
    else {
      w = height
      m = ev.clientY
      s = y
    }
    const cellWidth = w / props.items.length
    const cellNumber = Math.floor((m - s) / cellWidth)
    if (cellNumber >= 0 && cellNumber < props.items.length && cellNumber !== itemMoved.value) {
      emit('update:item', itemMoved.value, cellNumber)
      itemMoved.value = cellNumber
    }
  }
}

const onMouseUp = () => {
  itemMoved.value = null
}

onMounted(() => document.addEventListener('mouseup', onMouseUp))
onUnmounted(() => document.removeEventListener('mouseup', onMouseUp))
</script>

<template>
  <div
    ref="wrapper" class="VSortArray flex"
    :class="{ 'VSortArray--moved': (itemMoved !== null) }"
    @mousemove="onMouseMove"
  >
    <TransitionGroup name="VSortArray">
      <div
        v-for="(item, index) in items" :key="item.id"
        class="VSortArray__item"
        :class="{ 'VSortArray__item--moved': (index === itemMoved) }"
        @mousedown="onMouseDown(index)"
      >
        <slot :item="item" />
      </div>
    </TransitionGroup>
  </div>
</template>

<style>
.VSortArray {
  width: min-content;
}

.VSortArray__item {
  user-select: none;
}

.VSortArray-move {
  transition: all 0.2s ease-in-out;
}
</style>
