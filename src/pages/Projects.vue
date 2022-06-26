<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useProjectsStore } from '~/store/projects'
import type { Project } from '~/models/Project'
import { useSortFunctions } from '~/composables/useSortFunctions'
import { isAuthenticated } from '~/composables/isAuthenticated'

export default defineComponent({
  setup() {
    if (!isAuthenticated())
      return { store: null, projects: [] }

    const store = useProjectsStore()

    onMounted(() => store.loadProjects())

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
    }
  },
})
</script>

<template>
  <div class="projects-updating-indicator">
    <div v-if="store?.updating" class="projects-updating-indicator-on">
      updating...
    </div>
  </div>
  <ul v-if="!store?.loading" class="projects">
    <li v-for="p in projects" :key="p.id" class="project">
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
</template>

<style scope>

</style>
