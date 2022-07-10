<script setup lang="ts">
import { useRouter } from 'vue-router'
import { watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import Navigation from '~/components/Navigation.vue'
import { useUserStore } from '~/store/user'

const userStore = useUserStore()
const { t } = useI18n()
const router = useRouter()
watchEffect(() => {
  if (!userStore.user)
    router.push({ name: 'Login' })
})
</script>

<template>
  <div class="DashboardLayout h-screen flex flex-col w-full px-4">
    <header class="DashboardHeader">
      <div class="text-2xl font-bold">
        <RouterLink :to="{ name: 'Projects' }">
          {{ t('projects.link') }}
        </RouterLink>
      </div>
      <Navigation />
    </header>
    <main v-if="userStore.user" class="flex-grow grid">
      <RouterView />
    </main>
  </div>
</template>

<style>
.DashboardHeader {
  height: 4rem;;
  border-bottom: 3px solid var(--color-brand-1);
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr;
  gap: .5rem;
}
</style>
