import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/store/user'

export const isAuthenticated = () => {
  const router = useRouter()
  const user = useUserStore()
  if (!user.loggedIn) {
    router.push({ name: 'Login' })
    return false
  }
  else {
    watchEffect(() => {
      if (!user.loggedIn)
        router.push({ name: 'Login' })
    })
    return true
  }
}
