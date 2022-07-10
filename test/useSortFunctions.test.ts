import { describe, expect, it } from 'vitest'
import { createSortFunctions } from '~/composables/createSortFunctions'

interface TestObj {
  title: string
  id: number
}

describe('UseSortFunctions', () => {
  it('create sortBy functions', () => {
    const sf = createSortFunctions<TestObj>(['title', 'id'])

    expect(sf.title).toBeTypeOf('function')
    expect(sf.id).toBeTypeOf('function')
  })

  it('sorts array by..', () => {
    const sf = createSortFunctions<TestObj>(['title', 'id'])

    const objs: TestObj[] = [
      { title: 'A', id: 10 },
      { title: 'N', id: 4 },
      { title: 'B', id: 100 },
      { title: 'Z', id: 0 },
    ]

    const byTitle = objs.sort(sf.title).map(({ title }) => title)
    const byId = objs.sort(sf.id).map(({ id }) => id)

    expect(byTitle).toEqual(['A', 'B', 'N', 'Z'])
    expect(byId).toEqual([0, 4, 10, 100])
  })
})
