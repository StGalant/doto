<script lang="ts" setup>
import { computed, onUpdated, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProject } from '~/composables/getProject'
import VPlusMinus from '~/components/VPlusMinus.vue'
import VSortableGrid from '~/components/VSortableGrid.vue'
import type { Task } from '~/models/Task'
import { newTask } from '~/models/Task'
import type { DragData } from '~/composables/useDragNDrop'
import { getTasks } from '~/composables/getTasks'
import { tasksApi } from '~/api'
import TaskCard from '~/components/TaskCard.vue'
import VButton from '~/components/VButton.vue'
import VTags from '~/components/VTags.vue'
import ProjectEditForm from '~/components/ProjectEditForm.vue'

const props = defineProps<{ projectId: string }>()

const { updateTask } = tasksApi
const { t } = useI18n()
// const { user } = useUserStore()

const { project, error, isPending } = getProject(props.projectId)

const { tasks: projectTasks } = getTasks(props.projectId)

const tasks = computed(() => {
  if (!project.value)
    return {}

  const t: any = {}
  const sortedTasks = [...projectTasks.value].sort((a, b) => a.order - b.order)
  project.value.stages.forEach((stage) => {
    t[stage.id] = []
  })

  sortedTasks.reduce((t, task) => {
    t[task.stageId].push(task)
    return t
  }, t)

  return t
})

// move splitter
const contentRef = ref(null as unknown as HTMLElement)
const minContentHeight = 0
const maxContentHeight = () => {
  return document.documentElement.clientHeight * 0.5
}

const beginSplitDrag = () => {
  const moveSplitter = (e: MouseEvent) => {
    const { clientY } = e
    const { y } = contentRef.value.getBoundingClientRect()
    contentRef.value.style.height = `${Math.max(minContentHeight, Math.min(maxContentHeight(), clientY - y))}px`
  }

  const removeListeners = () => {
    document.removeEventListener('mousemove', moveSplitter)
    document.removeEventListener('mouseup', removeListeners)
  }

  document.addEventListener('mousemove', moveSplitter)
  document.addEventListener('mouseup', removeListeners)
}

// track drag status
const taskDragged = ref(false)
const dragTaskStart = () => taskDragged.value = true
const dragTaskEnd = () => taskDragged.value = false

// confirm modal state
const confirmOpen = ref(false)
const confirmMessage = ref('')
const confirmCallback = ref<null | (() => void)>(null)

// project modal state
const projectModalOpen = ref(false)
const projectModified = ref(false)

const openProjectForm = () => {
  projectModalOpen.value = true
  projectModified.value = false
}

const onCloseProjectForm = (force = false) => {
  if (!force && projectModified.value) {
    confirmOpen.value = true
    confirmMessage.value = t('form.modifiedAlert')
    confirmCallback.value = () => { onCloseProjectForm(true) }
  }
  else {
    projectModalOpen.value = false
    confirmOpen.value = false
    confirmCallback.value = null
  }
}

// task modal state
const currentTask = ref<Task | null>(null)
const taskModalOpen = ref(false)
const currentTaskModified = ref(false)

const onCloseTaskForm = (force = false) => {
  if (!force && currentTaskModified.value) {
    confirmOpen.value = true
    confirmMessage.value = t('form.modifiedAlert')
    confirmCallback.value = () => { onCloseTaskForm(true) }
  }
  else {
    taskModalOpen.value = false
    confirmOpen.value = false
    confirmCallback.value = null
    currentTask.value = null
  }
}

const openTaskForm = (task: Task) => {
  if (taskDragged.value)
    return
  currentTask.value = task
  currentTaskModified.value = false
  taskModalOpen.value = true
}

// add new task
const addTask = (stageId: string) => {
  if (!project.value)
    return
  const task = newTask(project.value.id)
  task.stageId = stageId
  openTaskForm(task)
}

// update task stage / order
const updateItem = (stageId: string, data: DragData) => {
  const task = projectTasks.value.find(t => t.id === data.id)
  const ii = data.insertIndex || 0
  const t = tasks.value[stageId]

  if (task) {
    let order = 0

    if (ii > 0 && ii < (t.length - 1)) {
      order = (t[ii].order + t[ii - 1].order) / 2
    }
    else if (ii === 0) {
      const iiOrder = t[ii]?.order || 2000
      order = iiOrder / 2
    }
    else if (ii >= (t.length - 1) && ii > 0) {
      order = t[t.length - 1].order + 1000
    }

    task.stageId = stageId
    task.order = order
    updateTask(task)
  }
  else {
    console.warn('task not exist: ', data, projectTasks.value)
  }
}

// Stage view
const ROW_HEIGHT_1 = 36
const ROW_HEIGHT_2 = 62

const stageView = ref<any>({})

watchEffect(() => {
  if (!project.value)
    return {}

  const sv: any = {}
  project.value.stages.forEach(({ id }) => sv[id] = { columns: 1, rowHeight: ROW_HEIGHT_1 })
  stageView.value = { ...sv, ...stageView.value }
})

const toggleStageViewColumns = (stageId: string) => {
  if (!stageView.value[stageId])
    return
  const oldValue = stageView.value[stageId].columns
  if (oldValue && oldValue === 1)
    stageView.value[stageId].columns = 2
  else
    stageView.value[stageId].columns = 1
}

const toggleStageViewRowHeight = (stageId: string) => {
  if (!stageView.value[stageId])
    return
  const oldValue = stageView.value[stageId].rowHeight
  if (oldValue && oldValue === ROW_HEIGHT_1)
    stageView.value[stageId].rowHeight = ROW_HEIGHT_2
  else
    stageView.value[stageId].rowHeight = ROW_HEIGHT_1
}

// ovesrcroll stages behavior
const projectStagesWrapperRef = ref(null as unknown as Element)
const projectStagesLeftRef = ref(null as unknown as Element)
const projectStagesRightRef = ref(null as unknown as Element)
const projectStagesLeftVisible = ref(true)
const projectStagesRightVisible = ref(true)
let projectStagesIntObserver

onUpdated(() => {
  if (!project.value)
    return
  projectStagesIntObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.target === projectStagesLeftRef.value)
        projectStagesLeftVisible.value = e.intersectionRatio === 1
      if (e.target === projectStagesRightRef.value)
        projectStagesRightVisible.value = e.intersectionRatio === 1
    })
  }, { root: projectStagesWrapperRef.value, threshold: 1 })
  projectStagesIntObserver.observe(projectStagesLeftRef.value)
  projectStagesIntObserver.observe(projectStagesRightRef.value)
})
</script>

<template>
  <div v-if="isPending">
    Loading...
  </div>
  <div v-if="error" class="theme-danger text-3xl font bold">
    {{ t('project.error') }}: {{ error }}
  </div>
  <div v-if="!isPending && !error && project" class="ProjectPage">
    <div class="ProjectPage__project-details w-full py-2">
      <div class="flex w-full">
        <h1 class="ProjectPage__title text-2xl font-semibold flex-grow">
          {{ project.title }}
        </h1>
        <VButton @click="openProjectForm">
          {{ t('form.button.edit') }}
        </VButton>
      </div>
      <VTags :model-value="project.tags" :color="true" :disabled="true" />
      <p ref="contentRef" class="ProjectPage__project-content">
        {{ project?.content }}
      </p>
      <div class="ProjectPage__splitter" @mousedown.prevent.stop="beginSplitDrag" />
    </div>
    <div
      ref="projectStagesWrapperRef"
      class="Project__stages-wrapper w-full h-full"
      :class="{
        'Project__stages-wrapper--scroll-left': !projectStagesLeftVisible,
        'Project__stages-wrapper--scroll-right': !projectStagesRightVisible,
      }"
    >
      <div ref="projectStagesLeftRef" class="w-0" />
      <div class="Project__stages">
        <div
          v-for="stage in project?.stages" :key="stage.id"
          class="Project__stage"
          :class="{
            'Project__stage--onecol': (stageView[stage.id].columns === 1),
            'Project__stage--twocol': (stageView[stage.id].columns === 2),
          }"
        >
          <div class="Project__stage-header gap-1">
            <div class="rounded-full w-4 h-4" :style="{ backgroundColor: stage.color || 'transparent' }" />
            <h1 class="text-xl flex items-center">
              {{ stage.name }}
            </h1>
            <div class="Project__stage-columns-toggle" @click="toggleStageViewRowHeight(stage.id)">
              <div v-if="stageView[stage.id].rowHeight === ROW_HEIGHT_1" i="tabler-square" />
              <div v-if="stageView[stage.id].rowHeight === ROW_HEIGHT_2" i="tabler-layout-rows" data-tooltip="Narrow Cards" />
            </div>
            <div class="Project__stage-columns-toggle" @click="toggleStageViewColumns(stage.id)">
              <div v-if="stageView[stage.id].columns === 1" i="tabler-columns" />
              <div v-if="stageView[stage.id].columns === 2" i="tabler-align-justified" />
            </div>
            <VPlusMinus
              v-if="!stage.final"
              class="Project__add-stage-button w-5 h-5 m-1 opacity-50 cursor-pointer"
              @click="addTask(stage.id)"
            />
          </div>
          <VSortableGrid
            :items="tasks[stage.id]"
            :cols="stageView[stage.id].columns"
            :row-height="stageView[stage.id].rowHeight"
            :gap="1"
            @drag-start="dragTaskStart"
            @drag-end="dragTaskEnd"
            @drop-item="updateItem(stage.id, $event)"
          >
            <template #default="{ item: task }">
              <div class="Project__task" @click="openTaskForm(task)">
                <div class="Project__task-content text-justify">
                  {{ task.content }}
                </div>
                <VTags :model-value="task.tags" :color="true" :disabled="true" />
              </div>
            </template>
          </VSortableGrid>
        </div>
      </div>
      <div ref="projectStagesRightRef" class="w-0" />
    </div>
    <teleport to="body">
      <div v-if="projectModalOpen" class="Project__modal" @click.self="onCloseProjectForm()">
        <div class="w-315">
          <ProjectEditForm
            :project="project"
            @save="onCloseProjectForm(true)"
            @cancel="onCloseProjectForm()"
            @modified="projectModified = true"
          />
        </div>
      </div>
      <div v-if="taskModalOpen" class="Project__modal" @click.self="onCloseTaskForm()">
        <div class="w-120">
          <TaskCard
            v-if="project"
            :task="currentTask"
            :stages="project.stages"
            @save-task="onCloseTaskForm(true)"
            @close="onCloseTaskForm()"
            @modified="currentTaskModified = true"
          />
        </div>
      </div>
      <div v-if="confirmOpen" class="Project__modal" @click.self="confirmOpen = false">
        <div class="Project__modal-confirm w-80">
          <div class="text-center mb-4">
            {{ confirmMessage }}
          </div>
          <div class="flex justify-around w-60 mx-auto">
            <VButton class="w-20" @click="confirmCallback">
              {{ t('form.button.yes') }}
            </VButton>
            <VButton class="w-20" @click="confirmOpen = false">
              {{ t('form.button.no') }}
            </VButton>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style>
.ProjectPage {
  display: grid;
  grid-template-rows: auto 1fr;
}

.Project__stages-wrapper {
  overflow-x: scroll;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  position: relative
}

.Project__stages-wrapper--scroll-left {
  border-left: 2px solid lightgray;
}

.Project__stages-wrapper--scroll-right {
  border-right: 2px solid lightgray;
}

.Project__stages {
  display: flex;
  gap: 1rem;
  max-width: 100%;
  margin: 0 auto;
}

.ProjectPage * {
  scrollbar-width: thin;
  scrollbar-color: var(--color-action-1) transparent;

}

.ProjectPage *::-webkit-scrollbar {
  width: .5rem;
  background-color: transparent;
}

.ProjectPtages *::-webkit-scrollbar-thumb {
  width: .5rem;
  background-color: var(--color-action-1);
}

.Project__stage-header {
  height: 2.5rem;
  display: grid;
  align-items: center;
  grid-template-columns: min-content 1fr;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  padding: 0 .25rem;
  border-bottom: 1px solid var(--color-text-secondary);
}

.Project__stage {
  display: grid;
  grid-template-rows: min-content 1fr;
  padding-left: 1rem;
}

.Project__stage--onecol {
  width: 18rem;
}

.Project__stage--twocol {
  width: 22vw;
  min-width: 28rem;
  max-width: 36rem;
}

.Project__stage:not(:first-child) {
  border-left: 1px solid var(--color-text-secondary);
}

.Project__stage:first-child {
  padding-left: 0;
}

.VSortableGrid {
  padding: .5rem 0 0 0;
}

.VSortableGrid__placeholder {
  border-radius: 5px;
  background-color: hsl(250deg, 80%, 90%);
  border: 2px solid hsl(250deg, 80%, 80%);
}

.VSortableGrid__placeholder--origin {
  border: none;
}

.Project__task {
  background-color: var(--color-background);
  width: 100%;
  height: 100%;
  display: grid;
  padding: 1rem .1rem .5rem .5rem;
  border-radius: 5px;
  border: 2px solid hsl(250deg, 90%, 70%);
  white-space: pre-wrap;
}
.Project__task-content {
  height: 100%;
  overflow-y: scroll;
  padding-right: .2rem;
}

.ProjectPage__project-content {
  overflow: auto;
  overflow-y: auto;
}

.ProjectPage__splitter {
  position: relative;
  height: 4px;
  background-color: var(--color-text-secondary);
  opacity: .33;
  cursor: row-resize;
  margin: 8px 0;
}

.Project__modal {
  position: fixed;
  inset: 0;
  display: grid;
  place-content: center;
  place-items: center;
  grid-template-columns: 100%;
  grid-template-rows: min-content;
  background: transparent;
  z-index: 1000;
  isolation: isolate;
}

.Project__modal::after {
  background-color: var(--color-background);
  opacity: 0.6;
  position: absolute;
  inset: 0;
  content: '';
  z-index: -1;
}

.Project__task-form {
  width: 100%;
  height: 100%;
  background-color: var(--color-background-secondary);
  opacity: 1;
  padding: 1rem;
  height: 20rem;
  display: grid;
  grid-template-rows: 1fr min-content;
}

.Project__task-form *:disabled {
  background-color: transparent;
}

.Project__task-form textarea,
.Project__task-form p {
  width: 100%;
  height: 100%;
  resize: none;
  overflow: auto;
}

.Project__add-stage-button::after {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background-color: var(--color-background-secondary);
  opacity: 0;
  transform: scale(0);
  transition: all 0.15s ease-out;
  z-index: -1;
}
.Project__add-stage-button:hover::after {
  opacity: .6;
  transform: scale(1);
}

.Project__add-stage-button:hover {
  color: var(--color-action-0);
  opacity: 1;
}

.Project__modal-confirm {
  background-color: var(--color-background);
  border-radius: 1.2rem;
  border: 4px solid var(--color-action-0);
  padding: 1rem;
}
</style>
