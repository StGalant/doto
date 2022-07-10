<script lang="ts" setup>
import { nextTick, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import VCheckbox from '~/components/VCheckbox.vue'
import VSortArray from '~/components/VSortArray.vue'
import VTags from '~/components/VTags.vue'
import type { Project } from '~/models/Project'

const props = defineProps<{ project: Project }>()
const emit = defineEmits(['update:project'])

const { t } = useI18n()

const project = reactive(props.project)
const stagesRef = ref(null as unknown as Element)

const toggleFinal = (id: string | number) => {
  const i = project.stages.findIndex(s => s.id === id)
  if (i >= 0)
    project.stages[i].final = !project.stages[i].final
}

const moveStage = (from: number, to: number) => {
  const stage = project.stages.splice(from, 1)[0]
  project.stages.splice(to, 0, stage)
}

const changeId = (oldId: string | number, newId: string) => {
  newId = newId.trim()
  if (!newId || oldId === newId)
    return

  const i = project.stages.findIndex(s => s.id === oldId)
  if (i >= 0) {
    project.stages[i].id = newId

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

  const i = project.stages.findIndex(s => s.id === id)
  if (i >= 0)
    project.stages[i].name = newName
}

const changeColor = (id: string | number, newColor: string) => {
  newColor = newColor.trim()
  if (!newColor)
    return

  const i = project.stages.findIndex(s => s.id === id)
  if (i >= 0)
    project.stages[i].color = newColor
}

const idCounter = ref(0)
const nextId = () => {
  const id = idCounter.value
  idCounter.value++
  return id
}

const addNewStage = (afterId: string) => {
  const i = project.stages.findIndex(s => s.id === afterId)
  const newStage = {
    id: `STAGE_${nextId()}`,
    name: '',
    color: '#ffffff',
    final: false,
  }

  project.stages.splice(i + 1, 0, newStage)
}

const deleteStage = (id: string) => {
  const i = project.stages.findIndex(s => s.id === id)
  project.stages.splice(i, 1)
}

watch(project, (p: Project) => emit('update:project', p))
</script>

<template>
  <form class="ProjectEditor__form p-2 mt-4" v-bind="$attrs" @submit.prevent="">
    <label>{{ t('project.title') }}:</label>
    <input v-model="project.title" name="title" :label="t('project.title')">
    <label>{{ t('project.content') }}:</label>
    <textarea v-model="project.content" name="content" />
    <label>{{ t('project.tags') }}:</label>
    <VTags v-model="project.tags" :color="true" />
    <label>{{ t('project.stages') }}:</label>
  </form>
  <div ref="stagesRef" class="ProjectEditor__stages-list">
    <VSortArray :items="project.stages" class="gap-2" @update:item="moveStage">
      <template #default="{ item: { id, name, color, final } }">
        <div class="ProjectEditor__stage-card">
          <div class="justify-self-end">
            Id:
          </div><input
            :value="id" class="w-full" required @mousedown.stop=""
            @change="changeId(id, ($event.target as HTMLInputElement).value)"
            @keydown.escape="($event.target as HTMLInputElement).value = id"
          >
          <div>{{ t('project.stage.name') }}:</div>
          <input
            class="w-full" :value="name" @mousedown.stop="" @change="changeName(id, $event.target.value)"
            @keydown.escape="($event.target as HTMLInputElement).value = name"
          >
          <input
            type="color" class="ProjectEditor__stage-card-color" :value="color || '#ffffff'"
            @input="changeColor(id, $event.target.value)"
          >
          <VCheckbox
            :model-value="final" class="ProjectEditor__stage-card-final"
            @update:model-value="toggleFinal(id)"
          >
            <div style="grid-column: 1;">
              {{ t('project.stage.isFinal') }}
            </div>
          </VCheckbox>
          <div class="ProjectEditor__stage-add" @click="addNewStage(id)">
            +
          </div>
          <div class="ProjectEditor__stage-delete theme-danger" @click="deleteStage(id)">
            <div i="carbon-trash-can" />
          </div>
        </div>
      </template>
    </VSortArray>
  </div>
</template>

<style>
.ProjectEditor__form {
  display: grid;
  gap: 1rem;
  grid-template-columns: auto 1fr;
}

.ProjectEditor__form-tags {
  grid-column: 2;
}

.ProjectEditor__form-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  grid-column: span 2;
}

.ProjectEditor__stage-card {
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

.ProjectEditor__stages-list {
  grid-column: 1 / -1;
  overflow-y: auto;
}

.ProjectEditor__stage-card-final {
  grid-column: span 2;
  justify-self: end;
  align-self: end;
}

.ProjectEditor__stage-card-color {
  grid-column: span 2;
}

.ProjectEditor__stage-add {
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

.ProjectEditor__stage-add:hover {
  opacity: 1;
  box-shadow: inset 0 0 0 1px lightgray;
  color: var(--color-action-0);
}

.ProjectEditor__stage-delete {
  grid-column: -1;
  opacity: .5;
  cursor: pointer;
}

.ProjectEditor__stage-delete:hover {
  opacity: 1;
  color: var(--color-action-0);
}

.ProjectEditor__form label {
  justify-self: end;
}
</style>
