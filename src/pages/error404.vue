<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <h1 class="text-4xl">
    {{ t('not-found') }}
  </h1>
</template>
