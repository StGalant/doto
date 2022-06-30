<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectsStore } from '~/store/projects'
import type { Project } from '~/models/Project'
import { useSortFunctions } from '~/composables/useSortFunctions'
import { isAuthenticated } from '~/composables/isAuthenticated'

export default defineComponent({
  setup() {
    if (!isAuthenticated())
      return { store: null, projects: [] }

    const { t } = useI18n()
    const store = useProjectsStore()

    store.loadProjects()

    const sortFunctions = useSortFunctions<Project>(['title', 'createdAt'])
    const sortBy = ref('title')
    const sortDir = ref<'asc' | 'desc'>('asc')
    const sortFn = computed(() => {
      let fn = sortFunctions[sortBy.value]
      if (sortDir.value === 'desc')
        fn = (a, b) => -1 * fn(a, b)
      return fn
    })
    const projects = computed(() => {
      return store.projects.slice().sort(sortFn.value)
    })

    return {
      projects,
      sortBy,
      sortDir,
      sortFn,
      store,
      t: t as any,
    }
  },
})
</script>

<template>
  <div class="container mx-auto">
    <RouterLink :to="{ name: 'NewProject' }">
      {{ t('projects.add') }} <div i="carbon-add" />
    </RouterLink>
    <ul v-if="!store?.loading" class="Projects__list">
      <li v-for="p in projects" :key="p.id" class="Projects__card" data-test-id="project-card">
        <div class="title">
          {{ p.title }}
        </div>
      </li>
    </ul>
    <ul v-if="store?.loading" class="projects projects-stub">
      <li v-for="i in 5" :key="i" class="project-stub">
        <div class="project-stub-content" />
      </li>
    </ul>
  </div>
</template>

<style scope>

</style>
