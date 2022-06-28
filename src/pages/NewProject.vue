<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VButton, VTags } from 'vue-design-test'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '~/store/projects'
import type { Project } from '~/models/Project'

const { t } = useI18n()
const router = useRouter()

const store = useProjectsStore()

const title = ref('')
const content = ref('')
const tags = ref<string[]>([])

const isPending = ref(false)

const onSubmit = async () => {
  try {
    // const project = await store.addProject({
    //   title: title.value,
    //   content: content.value,
    //   tags: tags.value,
    //   active: true,
    // } as Project)

    router.push({ name: 'Project', params: { id: 888 } })
  }
  catch (err) {

  }
}
</script>

<template>
  <div class="container">
    <div class="NewProject__wrapper mx-auto max-w-3xl">
      <h1 class="text-2xl">
        {{ t('project.new-heading') }}
      </h1>
      <form class="NewProject__form p-2 mt-4" :disabled="isPending" @submit.prevent="onSubmit">
        <label>{{ t('project.title') }}</label>
        <input v-model="title" name="title" :label="t('project.title')">
        <label>{{ t('project.content') }}</label>
        <textarea v-model="content" name="content" />
        <label>{{ t('project.tags') }}</label>
        <VTags v-model="tags" />
        <div class="NewProject__form-buttons">
          <VButton>
            {{ t('button.create') }}
          </VButton>
          <VButton secondary>
            {{ t('button.cancel') }}
          </VButton>
        </div>
      </form>
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
</style>
