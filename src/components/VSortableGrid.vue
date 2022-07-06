<script lang="ts" setup>
import { computed, nextTick, onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref, watchEffect } from 'vue'
import type { DragData, DragInfo, Intersection } from '../composables/useDragNDrop'
import useDragNDrop from '../composables/useDragNDrop'

const props = withDefaults(defineProps<{
  items: any[]
  namespace?: string
  name?: string
  dragSensitivity?: number
  cols?: number
  rowHeight?: string | number
  gap?: string | number
}>(), { dragSensitivity: 2, namespace: '', name: '', cols: 1, rowHeight: '6rem' })

const emit = defineEmits(['dragStart', 'dragEnd', 'dragItem', 'dropItem'])

enum State {
  idle,
  wait,
  drag,
}

const { onDrag, drag, dragCancel, rectMatcher, drop, unsubscribe } = useDragNDrop()
let itemsRefs = [] as HTMLElement[]
const dropzone = ref<HTMLElement>(null as unknown as HTMLElement)
const gridWrapper = ref<HTMLElement>(null as unknown as HTMLElement)
// refs do not sorted after update props!
// clear it and fill manually in template
onBeforeUpdate(() => {
  itemsRefs = []
})
const itemRef = (el: any, index: number) => {
  if (el)
    itemsRefs[index] = el
}

const state = ref(State.idle)
// move item context
const moveCtx = {
  startX: 0,
  startY: 0,
  offsetX: 0,
  offsetY: 0,
}
const placeholderIndex = ref<null | number>(null)
const placeholderRef = ref<HTMLElement>(null as unknown as HTMLElement)

let draggedIndex: null | number = null
const draggedItem = ref<any>({})
let draggedId: null | number = null
const draggedRef = ref<HTMLElement | null>(null)
let draggedHeight = 0
let draggedWidth = 0
const dragData = computed(() => ({
  id: draggedItem.value.id,
  namespace: props.namespace,
  listName: props.name,
  item: draggedItem.value,
} as DragData))

const gridStyle = computed<any>(() => {
  const style: any = {
    gridTemplateColumns: `repeat(${props.cols}, 1fr)`,
    gridAutoFlow: 'row',
    gridAutoRows: Number(props.rowHeight) ? `${0.25 * Number(props.rowHeight)}rem` : props.rowHeight,
  }
  if (props.gap)
    style.gap = Number(props.gap) ? `${0.25 * Number(props.gap)}rem` : props.gap

  return style
})

// place placeholder to DOM
watchEffect(() => {
  if (placeholderIndex.value !== null) {
    if (placeholderIndex.value === 0) { gridWrapper.value.prepend(placeholderRef.value) }
    else {
      if (draggedIndex !== null && placeholderIndex.value > draggedIndex && placeholderIndex.value < props.items.length)
        itemsRefs[placeholderIndex.value].after(placeholderRef.value)
      else
        itemsRefs[placeholderIndex.value - 1].after(placeholderRef.value)
    }

    if (placeholderIndex.value === draggedIndex)
      placeholderRef.value.classList.add('VSortableGrid__placeholder--origin')

    else
      placeholderRef.value.classList.remove('VSortableGrid__placeholder--origin')

    placeholderRef.value.scrollIntoView(false)
  }
  else {
    placeholderRef.value?.remove()
  }
})

const preventEvent = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
}

const resetDrag = () => {
  state.value = State.idle
  draggedIndex = null
  placeholderIndex.value = null
  dropzone.value.classList.remove('VSortableGrid--origin')
  dropzone.value.classList.remove('VSortableGrid--target')
  if (draggedRef.value) {
    draggedRef.value.style.left = null
    draggedRef.value.style.top = null
    draggedRef.value.style.width = null
    draggedRef.value.style.height = null
    draggedRef.value.classList.remove('VSortableGrid__item--dragged')
    const dr = draggedRef.value
    window.requestAnimationFrame(() => {
      dr.scrollIntoView(false)
      dr.removeEventListener('click', preventEvent, true)
    })

    draggedItem.value = {}
    draggedId = null
    draggedRef.value = null
    emit('dragEnd')
  }
}

const onMouseUp = () => {
  if (state.value === State.wait)
    resetDrag()

  if (state.value === State.drag)
    drop(dragData.value)
}

const onMouseMove = ({ clientX: mx, clientY: my }: MouseEvent) => {
  if (state.value === State.wait) {
    const radius2
      = (mx - moveCtx.startX) ** 2 + (my - moveCtx.startY) ** 2
    if (radius2 >= props.dragSensitivity ** 2) {
      // Drag start
      state.value = State.drag
      dropzone.value.classList.add('VSortableGrid--origin')
      const x = mx + moveCtx.offsetX
      const y = my + moveCtx.offsetY
      draggedItem.value = props.items[draggedIndex as number]
      draggedId = draggedItem.value.id
      draggedRef.value = itemsRefs[draggedIndex as number]
      const { height, width } = draggedRef.value.getBoundingClientRect()
      draggedRef.value.classList.add('VSortableGrid__item--dragged')
      draggedRef.value.style.left = `${x}px`
      draggedRef.value.style.top = `${y}px`
      draggedRef.value.style.height = `${height}px`
      draggedRef.value.style.width = `${width}px`
      draggedRef.value.addEventListener('click', preventEvent, true)
      draggedHeight = height
      draggedWidth = width
      placeholderIndex.value = draggedIndex
      drag({
        rect: { x, y, height: draggedHeight, width: draggedWidth },
        mouse: { x: mx, y: my },
      },
      dragData.value)
      emit('dragStart', dragData.value)
    }
  }

  if (state.value === State.drag && draggedRef.value) {
    // Drag item
    const x = mx + moveCtx.offsetX
    const y = my + moveCtx.offsetY
    draggedRef.value.style.left = `${x}px`
    draggedRef.value.style.top = `${y}px`
    drag({
      rect: { x, y, height: draggedHeight, width: draggedWidth },
      mouse: { x: mx, y: my },
    },
    dragData.value)
    emit('dragItem', dragData.value)
  }
}

const onEscapeKey = (ev: KeyboardEvent) => {
  if (state.value === State.drag && ev.key === 'Escape') {
    // cancel drag
    dragCancel()
    emit('dragEnd')
  }
}

const onMouseDown = ({ clientX: mx, clientY: my }: MouseEvent) => {
  if (state.value !== State.idle)
    return

  for (let i = 0; i < itemsRefs.length; i++) {
    const el = itemsRefs[i]
    const { x, y, width, height } = el.getBoundingClientRect()
    if (mx >= x && mx < (x + width) && my >= y && my < (y + height)) {
      moveCtx.startX = mx
      moveCtx.startY = my
      moveCtx.offsetX = x - mx
      moveCtx.offsetY = y - my
      draggedIndex = i
      break
    }
  }
  if (draggedIndex !== null)
    state.value = State.wait
}

const intersectionMatcher = rectMatcher(() => {
  const { x, y, height, width } = dropzone.value.getBoundingClientRect()
  return { x, y, height, width }
}, props.namespace)

const onDragOverCb = (di: DragInfo, i: Intersection, data: DragData) => {
  // namespace guard?
  // dropzone styling
  dropzone.value.classList.add('VSortableGrid--target')

  const { x: zx, y: zy, width: zw, height: zh } = gridWrapper.value.getBoundingClientRect()
  const cellWidth = zw / props.cols

  const rowsCount = Math.ceil(
    (props.items.length + ((placeholderIndex.value !== null && draggedIndex == null) ? 1 : 0))
    / props.cols,
  )
  const cellHeight = zh / rowsCount
  const { x, y } = di.mouse

  // for simplicity only mouse pointer determines a placeholder location
  let cx = Math.floor((x - zx) / cellWidth)
  let cy = Math.floor((y - zy) / cellHeight)

  if (cx < 0)
    cx = 0
  else if (cx >= props.cols)
    cx = props.cols - 1

  if (cy < 0)
    cy = 0

  const index = cx + cy * props.cols

  if (index < props.items.length)
    placeholderIndex.value = index
  else
    placeholderIndex.value = props.items.length
}

const onDragCancel = (global: boolean) => {
  if (state.value === State.drag && global) {
    // cancel drag
    resetDrag()
  }
  else {
    // move placeholder to initial state
    placeholderIndex.value = draggedIndex
  }
  dropzone.value.classList.remove('VSortableGrid--target')
}

const onDrop = (data: DragData) => {
  // if drop one the same place do nothing
  if (placeholderIndex.value !== draggedIndex)
    emit('dropItem', { ...data, insertIndex: placeholderIndex.value } as DragData)
}

// TODO: handle items update during dragging
onUpdated(() => {
  if (state.value === State.drag) {
    if (props.items.findIndex(item => item.id === draggedId) < 0)
      // cancel drag if dragged item not in list
      dragCancel()
  }
})

// global hooks
// register callbacks
onMounted(() => {
  onDrag(intersectionMatcher, onDragOverCb, onDragCancel, onDrop)

  document.addEventListener('mouseup', onMouseUp)
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('keydown', onEscapeKey)
})

// clear global hooks
onUnmounted(() => {
  unsubscribe(intersectionMatcher)
  document.removeEventListener('mouseup', onMouseUp)
  document.removeEventListener('keydown', onEscapeKey)
  document.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <div ref="dropzone" class="VSortableGrid" v-bind="$attrs" @mousedown="onMouseDown">
    <div ref="gridWrapper" class="VSortableGrid_grid-wrapper" :style="gridStyle">
      <div v-for="(item, index) in items" :key="item.id" :ref="(el) => itemRef(el, index)" class="VSortableGrid__item">
        <slot :item="item" />
      </div>
      <div ref="placeholderRef" class="VSortableGrid__placeholder" />
    </div>
  </div>
</template>

<style>
.VSortableGrid {
  overflow-y: scroll;
  scrollbar-width: thin;
  scrollbar-color: var(--color-action-1) transparent;
  scroll-behavior: smooth;
}

.VSortableGrid::-webkit-scrollbar {
  width: .5rem;
  background-color: transparent;
}

.VSortableGrid::-webkit-scrollbar-thumb {
  width: .5rem;
  background-color: var(--color-action-1);
}

.VSortableGrid_grid-wrapper {
  display: grid;
}

.VSortableGrid__item {
  user-select: none;
  overflow: hidden;
}

.VSortableGrid__placeholder {
  background-color: transparent;
  user-select: none;
  display: flex;
}

.VSortableGrid__item--dragged {
  position: fixed;
  z-index: 1000;
}
</style>
