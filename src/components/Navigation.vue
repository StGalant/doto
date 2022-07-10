<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useUserStore } from '~/store/user'

const userStore = useUserStore()
const userDisplay = computed(() => {
  const user = userStore.user
  if (user) {
    if (user.displayName)
      return user.displayName
    else
      return user.email
  }

  return ''
})

const { t, locale, availableLocales } = useI18n()
const toggleLocales = () => {
  const locales = availableLocales
  locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
}
</script>

<template>
  <nav class="Navigation">
    <div class="Navigation__links">
      <RouterLink :to="{ name: 'About' }">
        {{ t('nav.about') }}
      </RouterLink>
    </div>
    <div class="Navigation__utils">
      <div class="mx-2 text-center cursor-pointer" @click="toggleLocales()">
        {{ locale }}
      </div>
    </div>
    <div class="Navigation__user">
      <div v-if="userStore.loggedIn" class="flex items-center">
        <div>
          {{ userDisplay }}
        </div>
        <div i="carbon-logout" class="inline-block cursor-pointer ml-1" @click="userStore.logout()" />
      </div>
      <div v-else class="text-right">
        <RouterLink :to="{ name: 'Login' }" class="inline-flex items-center">
          {{ t('form.button.login') }}<div i="carbon-login" class="inline-block ml-1" />
        </RouterLink>
      </div>
    </div>
  </nav>
</template>

<style>
.Navigation {
  width: 100%;
  color: var(--color-brand-0);
  display: grid;
  grid-template-columns: 1fr [links] minmax(5rem, min-content) [utilities] minmax(4rem, auto) [user];
  gap: .5rem;
}

.Navigation__links {
  justify-self: end;
}

.Navigation__links a {
  color: currentColor;
}

.Navigation__utils {
  border-left: 1px solid var(--color-text-secondary);
  border-right: 1px solid var(--color-text-secondary);
}
</style>
