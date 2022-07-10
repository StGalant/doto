import { acceptHMRUpdate, defineStore } from 'pinia'
import type { User } from '~/models/User'
import { authApi } from '~/api'

const { authInit, login, logout } = authApi

export const useUserStore = defineStore('user', {
  state: (): { user: User | null } => {
    return {
      user: null,
    }
  },
  getters: {
    loggedIn(store) {
      return !!store.user
    },
  },
  actions: {
    async init() {
      await authInit((user) => {
        this.user = user
      })
    },
    async login(email: string, password: string) {
      await login(email, password)
    },
    logout() {
      logout()
    },
  },
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
