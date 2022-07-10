<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import VButton from '~/components/VButton.vue'
import { newProject } from '~/models/Project'
import { createProject } from '~/api'
import ProjectEditor from '~/components/ProjectEditor.vue'

const { t } = useI18n()
const router = useRouter()

const project = reactive(newProject())

// Save new project
const isPending = ref(false)
const error = ref<string | null>(null)
const onSubmit = async () => {
  isPending.value = true
  try {
    const { id } = await createProject(project)
    error.value = null
    router.push({ name: 'Project', params: { projectId: id } })
  }
  catch (err: any) {
    error.value = err.message
  }
  finally {
    isPending.value = false
  }
}
</script>

<template>
  <div class="container mx-auto w-full">
    <div class="flex w-200 items-baseline justify-between">
      <h1 class="text-2xl">
        {{ t('project.new') }}
      </h1>
      <div class="NewProject__form-buttons text-xl">
        <div class="btn" @click="onSubmit" @keydown.enter="onSubmit">
          {{ t('form.button.create') }}
        </div>
        <div class="btn secondary">
          {{ t('form.button.cancel') }}
        </div>
        <div v-if="error" class="theme-danger">
          {{ t(error) }}
        </div>
      </div>
    </div>
    <ProjectEditor v-model:project="project" class="w-200" />
  </div>
</template>

<style>
.NewProject__form {
  display: grid;
  gap: 1rem;
  grid-template-columns: auto 1fr;
}
.NewProject__form-tags {
  grid-column: 2;
}

.NewProject__form-buttons {
  display: flex;
  justify-content: center;
  grid-column: span 2;
}

.NewProject__stage-card {
  overflow: hidden;
  width: 15rem;
  height: auto;
  padding: 1rem 0 .25rem 1rem;
  border: 1px solid var(--color-text-secondary);
  background-color: var(--color-background);
  border-radius: .25rem;
  display: grid;
  grid-template-columns: auto 1fr;
  /* grid-template-rows: auto auto auto 1fr; */
  gap: 1rem;
  align-items: center;
}
.VSortArray {
  cursor: grab;
}
.VSortArray--moved {
  cursor: grabbing;
}
[data-dont-move-please] .VSortArray-move {
  transition: all 0s;
}

.NewProject__stages-list {
  grid-column: 1 / -1;
}

.NewProject__stage-card-final {
  grid-column: span 2;
  justify-self: end;
  align-self: end;
}

.NewProject__stage-card-color {
  grid-column: span 2;
}
</style>
