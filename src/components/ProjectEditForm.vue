<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProjectEditor from './ProjectEditor.vue'
import VButton from './VButton.vue'
import type { Project } from '~/models/Project'
import { projectApi } from '~/api'

const props = defineProps<{ project: Project }>()
const emit = defineEmits(['save', 'cancel', 'modified'])
const { t } = useI18n()
const currentProject = ref({ ...props.project, tags: [...props.project.tags] })
const modified = ref(false)
const error = ref<null | string>(null)
const pending = ref(false)

const updateProject = (p: Project) => {
  if (!modified.value) {
    emit('modified', true)
    modified.value = true
  }
  error.value = null
  currentProject.value = p
}

const { update } = projectApi.useProject(props.project.id)
const onSubmit = async () => {
  if (pending.value)
    return
  pending.value = true
  error.value = null
  try {
    const p = await update(currentProject.value)
    emit('save', p)
  }
  catch (err: any) {
    error.value = err
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="ProjectEditForm border-4">
    <div class="ProjectEditForm__header flex items-center justify-between my-2">
      <h1 class="text-2xl">
        {{ t('project.edit') }} {{ modified ? '*' : '' }}
      </h1>
      <div class="flex items-center gap-2">
        <VButton @click="onSubmit" @keydown.enter="onSubmit">
          {{ t('form.button.save') }}
        </VButton>
        <div i="carbon-close" class="close-icon cursor-pointer h-10 w-10" role="button" :aria-label="t('form.button.close')" @click="$emit('cancel')" />
        <div v-if="error" class="theme-danger">
          {{ t(error) }}
        </div>
      </div>
    </div>
    <ProjectEditor :project="currentProject" @update:project="updateProject" />
  </div>
</template>

<style>
.ProjectEditForm {
  background-color: var(--color-background);
  padding: .2rem .5rem .5rem .5rem;
  border-radius: 1.2rem;
  border-color: var(--color-border);
}

.ProjectEditForm__header {
  color: var(--color-brand-0);
}
</style>
