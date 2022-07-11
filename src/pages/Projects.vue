<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectsStore } from '~/store/projects'
import type { Project } from '~/models/Project'
import { createSortFunctions } from '~/composables/createSortFunctions'
import VButton from '~/components/VButton.vue'
import VTags from '~/components/VTags.vue'

export default defineComponent({
  components: { VButton, VTags },
  setup() {
    const { t } = useI18n()
    const sortFunctions = createSortFunctions<Project>(['title', 'createdAt'])
    const sortBy = ref('title')
    const sortDir = ref<'asc' | 'desc'>('asc')
    const sortFn = computed(() => {
      let fn = sortFunctions[sortBy.value]
      if (sortDir.value === 'desc')
        fn = (a, b) => -1 * fn(a, b)
      return fn
    })
    const store = useProjectsStore()
    store.loadProjects()
    const projects = computed(() => {
      return store.projects.slice().sort(sortFn.value)
    })
    return {
      projects,
      sortBy,
      sortDir,
      sortFn,
      store,
      t,
    }
  },
})
</script>

<template>
  <div class="container mx-auto">
    <VButton class="my-2" @click="$router.push({ name: 'NewProject' })">
      {{ t('projects.add') }} <div i="carbon-add" />
    </VButton>
    <ul v-if="!store?.loading" class="Projects__list">
      <li
        v-for="p in projects" :key="p.id"
        class="Projects__card"
        data-test-id="project-card"
        @click="$router.push({ name: 'Project', params: { projectId: p.id } })"
      >
        <div class="text-xl">
          {{ p.title }}
        </div>
        <VTags :model-value="p.tags" :color="true" :disabled="true" />
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
.Projects__list {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.Projects__card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 14rem;
  height: 8rem;
  border: 2px solid var(--color-brand-0);
  border-radius: 0.8rem;
  padding: .5rem;
  cursor: pointer;
}
</style>
