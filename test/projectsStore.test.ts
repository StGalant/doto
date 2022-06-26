import type { SpyInstanceFn } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Pinia } from 'pinia'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import mockedProjects from './__mocks__/mockedProjects'
import { useProjectsStore } from '~/store/projects'
import { loadCurrentProjects } from '~/api'

vi.mock('~/api')

describe('projectStore', () => {
  let pinia: Pinia
  let store: any
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    store = useProjectsStore()
    store.$reset()
    vi.resetAllMocks()
  })

  it('Initially in pending state, no error state', () => {
    expect(store.projects).toEqual([])
    expect(store.updating).toBe(true)
    expect(store.loading).toBe(true)
    expect(store.error).not.toBeTruthy()
  })

  it('loadProjects() calls api.loadCurrentProjects(onSnapshot, onError) and set error on failure', async () => {
    // let onSnapshot = () => {}
    let onError = (_e: any) => {}

    ;(loadCurrentProjects as SpyInstanceFn).mockImplementation((_s, e) => {
      // onSnapshot = s
      onError = e
    })

    store.loadProjects()

    onError(new Error('Mocked error'))

    await flushPromises()

    expect(store.projects).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.updating).toBe(false)
    expect(store.error).toBe('Mocked error')
  })

  it('loadProjects() calls api.loadCurrentProjects() and set projects on success', async () => {
    let onChange = (_: any) => {}

    ;(loadCurrentProjects as SpyInstanceFn).mockImplementation((s, _e) => {
      onChange = s
    })

    store.loadProjects()
    onChange(mockedProjects)

    await flushPromises()
    expect(store.projects).toEqual(mockedProjects)
    expect(store.updating).toBe(false)
    expect(store.loading).toBe(false)
    expect(store.error).not.toBeTruthy()
  })

  it('updates projects with subscription', async () => {
    let onChange = (_: any) => {}

    ;(loadCurrentProjects as SpyInstanceFn).mockImplementation((s, _e) => {
      onChange = s
    })

    store.loadProjects()
    onChange(mockedProjects)
    await flushPromises()
    expect(store.projects).toEqual(mockedProjects)

    // Change projects list
    const newProjects = [{
      id: '10',
      title: 'Project New Title',
      content: 'Really new content',
      ownerId: '1',
      membersIds: [],
      stages: ['TODO', 'INPROGRESS', 'DONE'],
      active: true,
      tags: [],
      createdAt: 0,
      updatedAt: 0,
    }]
    onChange(newProjects)

    await flushPromises()
    expect(store.projects).toEqual(newProjects)
    expect(store.error).not.toBeTruthy()
  })
})
