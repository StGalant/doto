<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import VButton from '~/components/VButton.vue'
import { newProject } from '~/models/Project'
import { projectApi } from '~/api'
import ProjectEditor from '~/components/ProjectEditor.vue'

const { t } = useI18n()
const router = useRouter()
const { createProject } = projectApi
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

const onCancel = () => {
  // TODO modified check
  router.push({ name: 'Projects' })
}
</script>

<template>
  <div class="container mx-auto w-full">
    <div class="flex w-200 items-center justify-between my-2">
      <h1 class="text-2xl">
        {{ t('project.new') }}
      </h1>
      <div class="NewProject__form-buttons">
        <VButton class="btn" @click="onSubmit" @keydown.enter="onSubmit">
          {{ t('form.button.create') }}
        </VButton>
        <VButton secondary @click="onCancel">
          {{ t('form.button.cancel') }}
        </VButton>
        <div v-if="error" class="theme-danger">
          {{ t(error) }}
        </div>
      </div>
    </div>
    <ProjectEditor v-model:project="project" class="w-200" />
  </div>
</template>

<style>
.NewProject__form-buttons {
  display: flex;
  justify-content: center;
  grid-column: span 2;
}
</style>
