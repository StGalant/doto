<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TaskEditor from '~/components/TaskEditor.vue'
import type { Task } from '~/models/Task'
import { tasksApi } from '~/api'
import type { Stage } from '~/models/Project'
import { useMessagesStore } from '~/store/messages'

const props = withDefaults(defineProps<{
  task: Task
  stages: Stage[]
  mode?: CardModes
  editEnable?: boolean
}>(), { editEnable: true })

const emit = defineEmits<{
  (e: 'saveTask', task: Task): void
  (e: 'close', modified: boolean): void
  (e: 'modified', m: boolean): void
}>()

const msgStore = useMessagesStore()
let prevErrorId: null | number = null

type CardModes = 'view' | 'edit'

const { t } = useI18n()

const currentTask = ref({ ...props.task, tags: [...props.task.tags] } as Task)
const pending = ref(false)
const modified = ref(false)
const isNewTask = !props.task.id
const currentMode = ref(props.mode ? props.mode : (isNewTask ? 'edit' : 'view'))
const cTask = computed({
  get: () => {
    if (currentMode.value === 'edit')
      return currentTask.value
    else
      return props.task
  },
  set: (t: Task) => {
    if (!modified.value)
      emit('modified', true)
    modified.value = true
    currentTask.value = t
  },
})

const onSaveTask = async () => {
  if (pending.value || !modified.value)
    return

  if (!cTask.value.content?.trim()) {
    if (prevErrorId)
      msgStore.deleteMessage(prevErrorId)
    prevErrorId = msgStore.pushError(t('error.contentEmpty'))
    return
  }

  // TODO validation
  pending.value = true
  try {
    if (isNewTask)
      await tasksApi.createTask(cTask.value)
    else
      await tasksApi.updateTask(cTask.value)
    emit('saveTask', cTask.value)
  }
  catch (err: any) {
    if (prevErrorId)
      msgStore.deleteMessage(prevErrorId)
    prevErrorId = msgStore.pushError(t(err))
  }
  finally {
    pending.value = false
  }
}

const onCancel = () => {
  if (pending.value)
    return
  emit('close', modified.value)
}

const editMode = () => {
  if (props.editEnable) {
    currentMode.value = 'edit'
    currentTask.value = { ...props.task, tags: [...props.task.tags] } as Task
  }
}

const heading = computed(() => {
  let h
  if (isNewTask)
    h = t('task.new')
  else
    h = ''

  if (modified.value)
    h += `${(isNewTask ? ' - ' : '') + t('task.modified')}*`

  return h
})
</script>

<template>
  <div class="TaskCard border-4">
    <div class="TaskCard__header flex justify-between mb-1">
      <div class="flex gap-1">
        <div>{{ heading }}</div>
      </div>
      <div class="flex items-center gap-1">
        <div v-if="currentMode === 'view' && editEnable" class="cursor-pointer text-sm underline" style="text-underline-offset: .3rem" role="button" @click="editMode">
          {{ t('form.button.edit') }}
        </div>
        <div v-if="currentMode === 'edit' && modified" class="cursor-pointer text-sm underline" style="text-underline-offset: .3rem" role="button" @click="onSaveTask">
          {{ t('form.button.save') }}
        </div>
        <div i="carbon-close" class="close-icon cursor-pointer" role="button" :aria-label="t('form.button.close')" @click="onCancel" />
      </div>
    </div>
    <TaskEditor
      v-model="cTask" :stages="stages" :mode="currentMode"
      :disabled="pending"
    />
  </div>
</template>

<style>
.TaskCard {
  position: relative;
  display: grid;
  background-color: var(--color-background);
  grid-template-rows: min-content [header] 1fr [card];
  padding: .2rem .5rem .5rem .5rem;
  border-radius: 1.2rem;
  border-color: var(--color-border);
}

.TaskCard__header {
  color: var(--color-brand-0);
}

.TaskCard__wrapper {
  display: grid;
  grid-template-rows: min-content [header] 1fr [card];
  padding: .2rem .5rem .5rem .5rem;
  border-radius: 1.2rem;
  border-color: var(--color-border);
}

.TaskCard__error {
  position: fixed;
  top: 0;
  left: 0;
  font-weight: bold;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: .25rem;
}

.TaskCard__error-message {
  background-color: var(--color-background);
  color: var(--color-action-0);
  padding: 1rem 2rem;
  border-radius: 5px;
}
</style>
