<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VButton } from 'vue-design-test'
import { useRouter } from 'vue-router'
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
  <div class="container">
    <div class="NewProject__wrapper mx-auto">
      <div>
        <h1 class="text-2xl">
          {{ t('project.new-heading') }}
        </h1>
        <div class="NewProject__form-buttons">
          <VButton @click="onSubmit" @keydown.enter="onSubmit">
            {{ t('form.button.create') }}
          </VButton>
          <VButton secondary>
            {{ t('form.button.cancel') }}
          </VButton>
          <div v-if="error" class="theme-danger">
            {{ t(error) }}
          </div>
        </div>
      </div>
      <ProjectEditor v-model:project="project" />
    </div>
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
  gap: 2rem;
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
.add-button {
  grid-column: 3;
  grid-row: 1/5;
  display: grid;
  place-items: center;
  padding: .25rem;
  font-size: 2rem;
  font-weight: bolder;
  opacity: .5;
  cursor: pointer;
}

.add-button:hover {
  opacity: 1;
  box-shadow: inset 0 0 0 1px lightgray;
  color: var(--color-action-0);
}

.delete-button {
  grid-column: -1;
  opacity: .5;
  cursor: pointer;
}

.delete-button:hover {
  opacity: 1;
  color: var(--color-action-0);
}
</style>
