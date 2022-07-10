<script setup lang="ts">
import Navigation from '~/components/Navigation.vue'
</script>

<template>
  <header class="DefaultHeader container mx-auto">
    <h1 class="Logo text-2xl font-bold inline-block">
      <RouterLink :to="{ name: 'Home' }">
        DOTO Application
      </RouterLink>
    </h1>
    <Navigation />
  </header>
  <main class="theme-default h-screen grid">
    <RouterView />
  </main>
</template>

<style>
.DefaultHeader {
  height: 4rem;;
  border-bottom: 3px solid var(--color-brand-1);
  display: grid;
  align-items: center;
  grid-template-columns: auto [logo] 1fr [nav];
  gap: .5rem;
}

.Logo a {
  color: var(--color-brand-0);
}
</style>
