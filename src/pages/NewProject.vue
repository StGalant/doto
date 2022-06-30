<script lang="ts" setup>
import { nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { VButton, VCheckbox, VSortArray, VTags } from 'vue-design-test'
import { useRouter } from 'vue-router'
// import type { Project } from '~/models/Project'
import { createProject } from '~/models/Project'

const { t } = useI18n()
const router = useRouter()

const newProject = reactive(createProject())

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
const stagesRef = ref(null as unknown as Element)

const toggleFinal = (id: string | number) => {
  const i = newProject.stages.findIndex(s => s.id === id)
  if (i >= 0)
    newProject.stages[i].final = !newProject.stages[i].final
}

const moveStage = (from: number, to: number) => {
  const stage = newProject.stages.splice(from, 1)[0]
  newProject.stages.splice(to, 0, stage)
}

const changeId = (oldId: string | number, newId: string) => {
  newId = newId.trim()
  if (!newId || oldId === newId)
    return

  const i = newProject.stages.findIndex(s => s.id === oldId)
  if (i >= 0) {
    newProject.stages[i].id = newId

    stagesRef.value.setAttribute('data-dont-move-please', '')
    nextTick(() => {
      stagesRef.value.removeAttribute('data-dont-move-please')
    })
  }
}

const changeName = (id: string | number, newName: string) => {
  newName = newName.trim()
  if (!newName)
    return

  const i = newProject.stages.findIndex(s => s.id === id)
  if (i >= 0)
    newProject.stages[i].name = newName
}

const changeColor = (id: string | number, newColor: string) => {
  newColor = newColor.trim()
  if (!newColor)
    return

  const i = newProject.stages.findIndex(s => s.id === id)
  if (i >= 0)
    newProject.stages[i].color = newColor
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
          <VButton>
            {{ t('button.create') }}
          </VButton>
          <VButton secondary>
            {{ t('button.cancel') }}
          </VButton>
        </div>
      </div>
      <form class="NewProject__form p-2 mt-4" :disabled="isPending" @submit.prevent="onSubmit">
        <label>{{ t('project.title') }}</label>
        <input v-model="newProject.title" name="title" :label="t('project.title')">
        <label>{{ t('project.content') }}</label>
        <textarea v-model="newProject.content" name="content" />
        <label>{{ t('project.tags') }}</label>
        <VTags v-model="newProject.tags" />
        <label>{{ t('project.stages') }}</label>
        <div ref="stagesRef" class="NewProject__stages-list">
          <VSortArray :items="newProject.stages" class="gap-1" @update:item="moveStage">
            <template #default="{ item: { id, name, color, final } }">
              <div class="NewProject__stage-card">
                <div class="justify-self-end">
                  Id:
                </div><input
                  :value="id"
                  class="w-full"
                  required
                  @mousedown.stop=""
                  @change="changeId(id, ($event.target as HTMLInputElement).value)"
                  @keydown.escape="($event.target as HTMLInputElement).value = id"
                >
                <div>{{ t('name') }}:</div>
                <input
                  class="w-full"
                  :value="name"
                  @mousedown.stop=""
                  @change="changeName(id, $event.target.value)"
                  @keydown.escape="($event.target as HTMLInputElement).value = name"
                >
                <input type="color" class="NewProject__stage-card-color" :value="color || '#ffffff'" @input="changeColor(id, $event.target.value)">
                <VCheckbox :model-value="final" class="NewProject__stage-card-final" @update:model-value="toggleFinal(id)">
                  <div style="grid-column: 1;">
                    {{ t('project.stage.isFinal') }}
                  </div>
                </VCheckbox>
                <div class="add-button">
                  +
                </div>
              </div>
            </template>
          </VSortArray>
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

.NewProject__stage-card {
  overflow: hidden;
  width: 12rem;
  height: 10rem;
  padding: 1rem 0 1rem 1rem;
  border: 1px solid var(--color-text-secondary);
  border-radius: .25rem;
  display: grid;
  grid-template-columns: auto 1fr;
  /* grid-template-rows: auto auto auto 1fr; */
  gap: .25rem;
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
  padding: .5rem;
  font-size: 1.2rem;
  font-weight: bolder;
  opacity: .5;
  cursor: pointer;
}

.add-button:hover {
  opacity: .8;
  box-shadow: inset 0 0 0 1px lightgray;
}
</style>
