import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import type { Pinia } from 'pinia'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import Home from '~/pages/Home.vue'
import { useUserStore } from '~/store/user'

// mock router
const push = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => {
    return {
      push,
    }
  },
}))

// create i18n plugin
const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  messages: {},
})

let pinia: Pinia
describe('Home', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.resetAllMocks()
  })

  it('redirects to login page if user is not logged in', async () => {
    shallowMount(Home, {
      global: {
        plugins: [i18n, pinia],
      },
    })

    await flushPromises()

    expect(push).toHaveBeenCalledOnce()
    expect(push).toHaveBeenCalledWith({ name: 'Login' })
  })
  it('redirects to projects page if user is already logged in', async () => {
    const user = useUserStore()
    user.user = { email: '__', token: '__', id: '001' }
    shallowMount(Home, {
      global: {
        plugins: [i18n],
      },
    })

    await flushPromises()

    expect(push).toHaveBeenCalledOnce()
    expect(push).toHaveBeenCalledWith({ name: 'Projects' })
  })
})
