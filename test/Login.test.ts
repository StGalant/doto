import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createI18n } from 'vue-i18n'

import Login from '~/pages/Login.vue'
import { useUserStore } from '~/store/user'

// mock router
const push = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({ redirectedFrom: null }),
}))

// create i18n plugin
const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  messages: {},
})

describe('Login', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('called login api and redirects to Home page', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [i18n, createTestingPinia({ createSpy: vi.fn })],
      },
    })

    const user = useUserStore()
    user.login = vi.fn(async (email, _password) => {
      user.user = { email, token: '__', id: '001' }
    })

    const email = 'exampmle@email.com'
    const password = 'P@ssw0rd'

    wrapper.find('[data-test-id="login-form"] input[type="email"]').setValue(email)
    wrapper.find('[data-test-id="login-form"] input[type="password"]').setValue(password)
    wrapper.find('[data-test-id="login-form"]').trigger('submit')
    await flushPromises()

    expect(user.login).toHaveBeenCalledOnce()
    expect(user.login).toHaveBeenCalledWith(email, password)
    expect(push).toHaveBeenCalledOnce()
    expect(push).toHaveBeenCalledWith({ name: 'Home' })
  })

  it('shows an error message', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [i18n, createTestingPinia({ createSpy: vi.fn })],
      },
    })

    const user = useUserStore()
    const testErrorMessage = 'Test Error message'
    user.login = vi.fn(async (_email, _password) => {
      throw new Error(testErrorMessage)
    })

    const email = 'exampmle@email.com'
    const password = 'P@ssw0rd'

    wrapper.find('[data-test-id="login-form"] input[type="email"]').setValue(email)
    wrapper.find('[data-test-id="login-form"] input[type="password"]').setValue(password)
    wrapper.find('[data-test-id="login-form"]').trigger('submit')
    await flushPromises()

    const errorWrapper = wrapper.find('[data-test-id="login-error"]').html()

    expect(errorWrapper).toContain(testErrorMessage)
    expect(user.login).toHaveBeenCalledOnce()
    expect(user.login).toHaveBeenCalledWith(email, password)
    expect(push).not.toHaveBeenCalled()
  })
})
