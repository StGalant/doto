export type OnCancel = null | (() => void)

export interface Rect {
  x: number
  y: number
  height: number
  width: number
}

export interface DragInfo {
  rect: Rect
  mouse: { x: number; y: number }
}

export interface Intersection {
  rect: Rect
  pointer: boolean
}

export type IntersectionMatcher = (di: DragInfo) => null | Intersection
export type IntersectionCallback = (di: DragInfo, i: Intersection, data: any, cancel?: boolean) => void

interface CurrentDragHandler {
  data: any
  onCancel: OnCancel
}

const emptyDragInfo = {
  rect: { x: 0, y: 0, height: 0, width: 0 },
  mouse: { x: 0, y: 0 },
}
const emptyIntersection = {
  rect: { x: 0, y: 0, height: 0, width: 0 },
  pointer: false,
}

const currentDragHandler: CurrentDragHandler = {
  data: null,
  onCancel: null,
}

const dragStart = (di: any, onCancel: OnCancel = null) => {
  if (currentDragHandler.data || !di)
    return false

  currentDragHandler.data = di
  currentDragHandler.onCancel = onCancel
  return true
}

const matchers = new Map<IntersectionMatcher, IntersectionCallback>()

const dragCancel = () => {
  try {
    currentDragHandler.onCancel?.call(undefined)
  }
  finally {
    currentDragHandler.data = null
    currentDragHandler.onCancel = null
    matchers.forEach((cb) => { cb(emptyDragInfo, emptyIntersection, null, true) })
  }
}

const onDrag = (matcher: IntersectionMatcher, cb: IntersectionCallback) => {
  matchers.set(matcher, cb)
}

const onDragRemove = (matcher: IntersectionMatcher) => {
  matchers.delete(matcher)
}

const drag = (di: DragInfo) => {
  interface IntObj { i: Intersection; cb: IntersectionCallback }
  const intersections: IntObj[] = []
  let winner: IntObj | null = null
  matchers.forEach((cb, matcher) => {
    const i = matcher(di)
    if (i)
      intersections.push({ i, cb })
  })

  if (intersections.length === 1)
    winner = intersections[0]

  if (intersections.length > 1) {
    const withPointer = intersections.find(({ i }) => {
      if (i.pointer)
        return true
      else
        return undefined
    })

    if (withPointer) {
      winner = withPointer
    }
    else {
      winner = intersections.reduce<IntObj>((winner, current) => {
        const winnerS = winner.i.rect.height * winner.i.rect.width
        const currentS = current.i.rect.height * current.i.rect.width
        if (currentS > winnerS)
          return current
        else
          return winner
      }, intersections[0])
    }
  }

  if (winner)
    winner.cb(di, winner.i, currentDragHandler.data)
}

const useDragNDrop = () => ({
  dragStart,
  dragCancel,
  onDrag,
  onDragRemove,
  drag,
})

export default useDragNDrop
