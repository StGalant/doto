<script lang="ts">
import { defineComponent, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/store/user'

export default defineComponent({
  setup() {
    const user = useUserStore()
    const router = useRouter()
    watchEffect (() => {
      if (user.loggedIn)
        router.push({ name: 'Projects' })
      else
        router.push({ name: 'Login' })
    })
  },
})
</script>

<template>
  <div />
</template>
