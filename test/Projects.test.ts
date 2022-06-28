import { flushPromises, mount, shallowMount } from '@vue/test-utils'
import type { SpyInstanceFn } from 'vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'
import mockedProjects from './__mocks__/mockedProjects'
import Projects from '~/pages/Projects.vue'
import { useProjectsStore } from '~/store/projects'
import { isAuthenticated } from '~/composables/isAuthenticated'

// create i18n plugin
const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  messages: {},
})

vi.mock('~/composables/isAuthenticated')
;(isAuthenticated as SpyInstanceFn).mockReturnValue(true)

describe('Projects', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('use isAutenticated() guard dunction', async () => {
    (isAuthenticated as SpyInstanceFn).mockReturnValue(false)
    shallowMount(Projects, {
      global: {
        plugins: [i18n, createTestingPinia({ createSpy: vi.fn })],
      },
    })

    await flushPromises()

    expect(isAuthenticated).toHaveBeenCalledOnce()
  })

  it('renders projects from projectsStore', async () => {
    (isAuthenticated as SpyInstanceFn).mockReturnValue(true)

    const wrapper = mount(Projects, {
      global: {
        plugins: [i18n, createTestingPinia({ createSpy: vi.fn })],
      },
    })

    const store = useProjectsStore()
    store.projects = mockedProjects
    store.loading = false
    await flushPromises()
    const projectsCards = wrapper.findAll('[data-test-id="project-card"]')
    expect(projectsCards.length).toBe(2)
    expect(projectsCards[0].html()).toContain(mockedProjects[0].title)
    expect(projectsCards[1].html()).toContain(mockedProjects[1].title)
  })
})
