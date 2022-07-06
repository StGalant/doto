<script lang="ts" setup>
import { computed, onUnmounted, ref } from 'vue'
import { getProject } from '~/composables/getProject'
import VPlusMinus from '~/components/VPlusMinus.vue'
import VSortableGrid from '~/components/VSortableGrid.vue'
import type { Task } from '~/models/Task'
import { useUserStore } from '~/store/user'
import type { User } from '~/models/User'
import type { Project } from '~/models/Project'

const props = defineProps<{ projectId: string }>()

const { user } = useUserStore()

const { project, error, isPending } = getProject(props.projectId)

const projectTasks = [{
  id: '1',
  projectId: '1',
  ownwerId: '1',
  stageId: 'IDEA',
  order: 100,
  createdAt: '',
  updatedAt: '',
  tags: [],
  content: 'Первая задача: ....',
}]

const tasks = computed(() => {
  if (!project.value)
    return {}

  const t: any = {}
  project.value.stages.forEach((stage) => {
    t[stage.id] = []
  })

  projectTasks.reduce((t, task) => {
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
</script>

<template>
  <div class="ProjectPage">
    <div class="ProjectPage__project-details">
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
    <div class="Project__stages">
      <div v-for="stage in project?.stages" :key="stage.id" class="Project__stage">
        <div class="Project__stage-header">
          <h1 class="text-xl flex items-center">
            {{ stage.name }}
          </h1>
          <VPlusMinus v-if="!stage.final" class="Project__add-stage-button w-5 h-5 m-1 opacity-50 cursor-pointer" @click="addTask(stage.id)" />
        </div>
        <VSortableGrid
          :items="tasks[stage.id]" class="w-120" :cols="2" row-height="30" @drag-start="dragTaskStart"
          @drag-end="dragTaskEnd"
        >
          <template #default="{ item: task }">
            <div class="Project__task" @click="openTaskForm(task)">
              <div i="carbon-maximize" class="w-3 h-3" @click="openTaskForm(task)" @mousedown.prevent.stop="" />
              <div>
                {{ task.content }}
              </div>
            </div>
          </template>
        </VSortableGrid>
      </div>
    </div>
    <teleport to="body">
      <div v-if="currentTask" ref="modalWrapperRef" class="Project__modal">
        <div class="Project__task-form md:w-120 sm:w-full">
          <textarea :value="currentTask.content" :disabled="taskFormMode === 'view'" />
          <div v-if="taskFormMode === 'view'" i="carbon-edit" @click="taskFormMode = 'edit'" />
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

.Project__stages {
  display: flex;
  gap: 1rem;
  justify-content: center;
  overflow-x: scroll;
  scrollbar-width: thin;
  scrollbar-color: var(--color-action-1) transparent;
}

.Project__stages::-webkit-scrollbar {
  width: .5rem;
  background-color: transparent;
}

.Project__stages::-webkit-scrollbar-thumb {
  width: .5rem;
  background-color: var(--color-action-1);
}

.Project__stage-header {
  height: 2.5rem;
  display: grid;
  align-items: center;
  grid-template-columns: 1fr;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  padding: 0 .25rem;
}

.Project__stage {
  display: grid;
  grid-template-rows: min-content 1fr;
}

.VSortableGrid {
  background-color: var(--color-background-secondary);
  padding: .5rem 0 0 .5rem;
}

.Project__task {
  background-color: khaki;
  width: 100%;
  height: 100%;
  padding: 0 1rem 1rem 1rem;
}

.ProjectPage__project-content {
  overflow: auto;
}

.ProjectPage__splitter {
  position: relative;
  height: 5px;
  background-color: var(--color-background-secondary);
  cursor: row-resize;
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
  box-shadow: 0 0 1rem 2px var(--color-action-1);
  padding: 1rem;
  height: 20rem;
  display: grid;
  grid-template-rows: 1fr min-content;
}

.Project__task-form *:disabled {
  background-color: transparent;
}

.Project__task-form textarea {
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
