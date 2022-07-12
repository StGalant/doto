<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '@vueuse/head'
import { isDark, preferredDark } from '~/composables/dark'
import { useAppInit } from '~/composables/useAppInit'
import { useUserStore } from '~/store/user'
import Background from '~/components/Background.vue'
// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'DOTo',
  meta: [
    { name: 'description', content: 'Opinionated Vite Starter Template' },
    {
      name: 'theme-color',
      content: computed(() => isDark.value ? '#00aba9' : '#ffffff'),
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: computed(() => preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg'),
    },
  ],
})

const { initialized } = useAppInit()
if (!import.meta.env.SSR) {
  const userStore = useUserStore()
  Promise.allSettled([userStore.init()])
    .then(() => initialized.value = true)
}
</script>

<template>
  <div id="app-message" />
  <Background />
  <RouterView v-if="initialized" />
</template>

<style>
 #app-message {
  position: fixed;
  top: 0;
  left: 0;
  font-weight: bold;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: .25rem;
 }
</style>
