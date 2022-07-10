<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '@vueuse/head'
import { isDark, preferredDark } from '~/composables/dark'
import { useAppInit } from '~/composables/useAppInit'
import { useUserStore } from '~/store/user'

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
  <RouterView v-if="initialized" />
</template>
