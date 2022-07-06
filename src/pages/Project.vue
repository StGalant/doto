<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { getProject } from '~/composables/getProject'
import VPlusMinus from '~/components/VPlusMinus.vue'
import VSortableGrid from '~/components/VSortableGrid.vue'
import type { Task } from '~/models/Task'
import { useUserStore } from '~/store/user'
import type { User } from '~/models/User'
import type { Project } from '~/models/Project'
import type { DragData } from '~/composables/useDragNDrop'

const props = defineProps<{ projectId: string }>()

const { user } = useUserStore()

const { project, error, isPending } = getProject(props.projectId)

const projectTasks = ref<any[]>([{
  id: '1',
  projectId: '1',
  ownwerId: '1',
  stageId: 'IDEA',
  order: 100,
  createdAt: '',
  updatedAt: '',
  tags: [],
  content: 'Lorem ipsum',
}])

const tasks = computed(() => {
  if (!project.value)
    return {}

  const t: any = {}
  project.value.stages.forEach((stage) => {
    t[stage.id] = []
  })

  projectTasks.value.reduce((t, task) => {
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
// open task view
const currentTask = ref<Task | null>(null)
const taskFormMode = ref<'view' | 'edit' | 'new'>('view')

const modalWrapperRef = ref(null as unknown as Element)
const closeTaskForm = (e: Event) => {
  if (e.target !== modalWrapperRef.value)
    return
  currentTask.value = null
  document.removeEventListener('click', closeTaskForm)
}

const openTaskForm = (task: Task) => {
  if (taskDragged.value)
    return
  currentTask.value = task
  taskFormMode.value = 'view'
  document.addEventListener('click', closeTaskForm)
}

onUnmounted(() => document.removeEventListener('click', closeTaskForm))

// add task
const addTask = (stageId: string) => {
  const newTask = {
    id: '',
    projectId: (project.value as Project).id,
    ownwerId: (user as User).id,
    stageId,
    tags: [],
    content: '',
    order: -1,
    createdAt: '',
    updatedAt: '',
  } as Task
}

const updateItem = (stageId: string, data: DragData) => {
  const i = projectTasks.value.findIndex(t => t.id === data.id)
  if (i >= 0) {
    projectTasks.value[i].stageId = stageId
    let order
    if (data.insertIndex && tasks.value[stageId]) {
      const t = tasks.value[stageId]
      if (data.insertIndex === tasks.value[stageId].length)
        order = t[t.length - 1].order + 100

      else if (data.insertIndex === 0)
        order = t[0] ? t[0].order / 2 : 100

      else
        order = (t[data.insertIndex].order - t[data.insertIndex - 1].order) / 2

      projectTasks.value[i].order = order
    }
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

onMounted(() => {
  projectStagesIntObserver = new IntersectionObserver((entries) => {
    console.log(entries)
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
  <div class="ProjectPage">
    <div class="ProjectPage__project-details w-full">
      <div v-if="isPending">
        Loading...
      </div>
      <div v-if="error" class="theme-danger">
        {{ error }}
      </div>
      <h1 class="text-3xl">
        {{ project?.title }}
      </h1>
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
              <div v-if="stageView[stage.id].rowHeight === ROW_HEIGHT_2" i="tabler-layout-rows" />
            </div>
            <div class="Project__stage-columns-toggle" @click="toggleStageViewColumns(stage.id)">
              <div v-if="stageView[stage.id].columns === 1" i="tabler-columns" />
              <div v-if="stageView[stage.id].columns === 2" i="tabler-align-justified" />
            </div>
            <VPlusMinus v-if="!stage.final" class="Project__add-stage-button w-5 h-5 m-1 opacity-50 cursor-pointer" @click="addTask(stage.id)" />
          </div>
          <VSortableGrid
            :items="tasks[stage.id]"
            :cols="stageView[stage.id].columns"
            :row-height="stageView[stage.id].rowHeight"
            @drag-start="dragTaskStart"
            @drag-end="dragTaskEnd"
            @drop-item="updateItem(stage.id, $event)"
          >
            <template #default="{ item: task }">
              <div class="Project__task" @click="openTaskForm(task)">
                <div class="Project__task-content text-justify">
                  {{ task.content }}
                </div>
              </div>
            </template>
          </VSortableGrid>
        </div>
      </div>
      <div ref="projectStagesRightRef" class="w-0" />
    </div>
    <teleport to="body">
      <div v-if="currentTask" ref="modalWrapperRef" class="Project__modal">
        <div class="Project__task-form md:w-120 sm:w-full">
          <textarea v-show="taskFormMode !== 'view'" :value="currentTask.content" :disabled="taskFormMode === 'view'" />
          <div v-show="taskFormMode === 'view'">
            {{ currentTask.content }}
          </div>
          <div v-if="taskFormMode === 'view'" i="carbon-edit" @click="taskFormMode = 'edit'" />
          <div v-if="taskFormMode !== 'view'" i="clarity-eye-solid" @click="taskFormMode = 'view'" />
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
  border: 2px solid orange;
}

.VSortableGrid__placeholder--origin {
  border: 2px solid gray;
}

.Project__task {
  background-color: rgb(255, 245, 154);
  width: 100%;
  height: 100%;
  display: grid;
  padding: 1rem .1rem .5rem .5rem;
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
</style>
