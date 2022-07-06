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

export interface DragData {
  namespace: string
  listName: string
  id: string | number
  item: any
  insertIndex?: number
}

export interface Intersection {
  rect: Rect
  pointer: boolean
}

export type IntersectionMatcher = (di: DragInfo, data: DragData) => null | Intersection
export type IntersectionCallback = (di: DragInfo, i: Intersection, data: DragData) => void
export type CancelCallback = (global: boolean) => void
export type DropCallback = (data: DragData) => void

const matchers = new Map<IntersectionMatcher, [IntersectionCallback, CancelCallback, DropCallback]>()

const dragCancel = () => {
  matchers.forEach(([_, cbc]) => { cbc(true) })
}

const onDrag = (matcher: IntersectionMatcher, cb: IntersectionCallback, cbc: CancelCallback, dcb: DropCallback) => {
  matchers.set(matcher, [cb, cbc, dcb])
}

const unsubscribe = (matcher: IntersectionMatcher) => {
  matchers.delete(matcher)
}

let prevWinnerKey: IntersectionMatcher | null = null
const drag = (di: DragInfo, data: DragData) => {
  interface WinObj { i: Intersection; cb: IntersectionCallback; matcher: IntersectionMatcher }
  const intersections: WinObj[] = []
  let winner: WinObj | null = null
  matchers.forEach(([cb, _], matcher) => {
    const i = matcher(di, data)
    if (i)
      intersections.push({ i, cb, matcher })
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
      winner = intersections.reduce<WinObj>((winner, current) => {
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
    winner.cb(di, winner.i, data)

  if (!winner || winner.matcher !== prevWinnerKey) {
    if (prevWinnerKey) {
      const c = matchers.get(prevWinnerKey)
      if (c)
        c[1](false)
    }
  }
  prevWinnerKey = winner === null ? null : winner.matcher
}

const drop = (data: DragData) => {
  if (prevWinnerKey) {
    const c = matchers.get(prevWinnerKey)
    if (c)
      c[2](data)
  }
  dragCancel()
}

function rectMatcher(zoneRect: Rect | (() => Rect), namespace?: string | string[]): IntersectionMatcher {
  return ({ rect: { x, y, width: w, height: h }, mouse: { x: mx, y: my } }: DragInfo, data: DragData): null | Intersection => {
    // namespace guards
    if (namespace && typeof namespace === 'string' && data.namespace !== namespace)
      return null

    if (namespace && typeof namespace === 'object' && !namespace.includes(data.namespace))
      return null

    let zx, zy, zw, zh

    if (typeof zoneRect === 'function')
      ({ x: zx, y: zy, width: zw, height: zh } = zoneRect())
    else
      ({ x: zx, y: zy, width: zw, height: zh } = zoneRect)

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

const useDragNDrop = () => ({
  dragCancel,
  onDrag,
  unsubscribe,
  drag,
  rectMatcher,
  drop,
})

export default useDragNDrop
