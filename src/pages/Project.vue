<script lang="ts" setup>
import { useRoute } from 'vue-router'

const route = useRoute()
const projectId = route.params.id
</script>

<template>
  <h1 class="text-3xl">
    {{ projectId }}
  </h1>
</template>

<style>

</style>
