<script setup lang="ts">
import Navigation from '~/components/Navigation.vue'
import { useAppInit } from '~/composables/useAppInit'
import { useUserStore } from '~/store/user'

const { initialized } = useAppInit()
if (!import.meta.env.SSR) {
  const userStore = useUserStore()
  Promise.allSettled([userStore.init()])
    .then(() => initialized.value = true)
}
</script>

<template>
  <main v-if="initialized" class="container mx-auto theme-default">
    <Navigation />
    <RouterView />
  </main>
</template>
