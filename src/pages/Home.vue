<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { isAuthenticated } from '~/composables/isAuthenticated'

export default defineComponent({
  setup() {
    if (!isAuthenticated())
      return {}
    const router = useRouter()
    router.push({ name: 'Projects' })
  },
})
</script>

<template>
  <div />
</template>
