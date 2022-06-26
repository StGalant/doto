import { beforeEach, describe, expect, it, vi } from 'vitest'
import useDragNDrop from '~/composables/useDragNDrop'
import type { DragInfo, Intersection, Rect } from '~/composables/useDragNDrop'

const dragData = {
  task: {
    id: '1',
  },
  el: null,
  text: 'task text',
}

function rectMatcher({ x: zx, y: zy, width: zw, height: zh }: Rect) {
  return ({ rect: { x, y, width: w, height: h }, mouse: { x: mx, y: my } }: DragInfo): null | Intersection => {
    if (x + w < zx || x >= zx + zw || y + h < zy || y >= zy + zh) { return null }
    else {
      const pointer = mx >= zx && mx < zx + zw && my >= zy && my < zy + zh
      const ix = Math.max(x, zx)
      const iy = Math.max(y, zy)
      const iw = Math.min(x + w, zx + zw) - ix
      const ih = Math.min(y + h, zy + zh) - iy
      return {
        rect: { x: ix, y: iy, width: iw, height: ih },
        pointer,
      }
    }
  }
}

describe('Drag and Drop', () => {
  beforeEach(() => {
    const { dragCancel } = useDragNDrop()
    dragCancel()
  })

  it('provides dragStart/dragCancel api', () => {
    const { dragStart, dragCancel } = useDragNDrop()

    const onCancel = vi.fn()

    let confirm = dragStart(dragData, onCancel)
    expect(confirm).toBe(true)

    confirm = dragStart(dragData)
    expect(confirm).toBe(false)

    dragCancel()
    expect(onCancel).toBeCalledTimes(1)

    confirm = dragStart(dragData)
    expect(confirm).toBe(true)
  })

  it('provides drag/onDrag/dragCancel api', () => {
    const { dragStart, drag, onDrag, dragCancel, onDragRemove } = useDragNDrop()
    if (!dragStart(dragData))
      throw new Error('dragStart fail')

    const dropZoneA = {
      x: 500,
      y: 500,
      width: 200,
      height: 200,
    } as Rect

    const dropZoneB = {
      x: 750,
      y: 500,
      width: 200,
      height: 200,
    } as Rect

    const dragMatcherA = vi.fn(rectMatcher(dropZoneA))
    const dragMatcherB = vi.fn(rectMatcher(dropZoneB))

    const dragCallbackA = vi.fn()
    const dragCallbackB = vi.fn()

    onDrag(dragMatcherA, dragCallbackA)
    onDrag(dragMatcherB, dragCallbackB)

    // all matchers has been called but no callbacks
    let rect = {
      x: 10,
      y: 10,
      width: 200,
      height: 150,
    }
    let mouse = {
      x: 100,
      y: 100,
    }

    vi.clearAllMocks()
    drag({ rect, mouse })
    expect(dragMatcherA).toBeCalledTimes(1)
    expect(dragMatcherA).toBeCalledWith({ rect, mouse })
    expect(dragMatcherB).toBeCalledTimes(1)
    expect(dragMatcherB).toBeCalledWith({ rect, mouse })
    expect(dragCallbackA).toBeCalledTimes(0)
    expect(dragCallbackB).toBeCalledTimes(0)

    // callback for intersected dropzone is called
    rect = {
      x: 510,
      y: 510,
      width: 200,
      height: 150,
    }

    mouse = {
      x: 600,
      y: 600,
    }

    vi.clearAllMocks()
    drag({ rect, mouse })
    expect(dragCallbackA).toBeCalledTimes(1)
    expect(dragCallbackB).toBeCalledTimes(0)
    expect(dragCallbackA).toBeCalledWith({ rect, mouse }, {
      rect: {
        x: 510,
        y: 510,
        width: 190,
        height: 150,
      },
      pointer: true,
    }, dragData)

    // dropzone with most intersection area wins
    rect = {
      x: 690,
      y: 510,
      width: 200,
      height: 150,
    }

    mouse = {
      x: 710,
      y: 600,
    }

    vi.clearAllMocks()
    drag({ rect, mouse })
    expect(dragCallbackA).toBeCalledTimes(0)
    expect(dragCallbackB).toBeCalledTimes(1)

    // dropzone with pointer within wins
    mouse = {
      x: 695,
      y: 600,
    }
    vi.clearAllMocks()
    drag({ rect, mouse })
    expect(dragCallbackA).toBeCalledTimes(1)
    expect(dragCallbackB).toBeCalledTimes(0)

    // dragCancel calls all callbacks with cancel parameter set to 'true'
    vi.clearAllMocks()
    dragCancel()
    expect(dragCallbackA).toBeCalledTimes(1)
    expect(dragCallbackB).toBeCalledTimes(1)
    expect(dragCallbackB).toBeCalledWith({
      rect: { x: 0, y: 0, height: 0, width: 0 },
      mouse: { x: 0, y: 0 },
    }, {
      rect: { x: 0, y: 0, height: 0, width: 0 },
      pointer: false,
    }, null, true)

    // remove dropzone
    onDragRemove(dragMatcherA)
    vi.clearAllMocks()
    drag({ rect, mouse })
    expect(dragCallbackA).toBeCalledTimes(0)
  })
})

