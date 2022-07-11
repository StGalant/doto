<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VSelect from '~/components/VSelect.vue'
import VTags from '~/components/VTags.vue'
import type { Stage } from '~/models/Project'
import type { Task } from '~/models/Task'

const props = withDefaults(defineProps<{
  modelValue: Task
  stages: Stage[]
  mode?: 'view' | 'edit'
  disabled?: boolean
}>(), {
  mode: 'view',
  disabled: true,
})

defineEmits<{ (e: 'update:modelValue', t: Task): void }>()

const { t } = useI18n()

const stage = computed(() => props.stages.find(s => s.id === props.modelValue.stageId))
</script>

<template>
  <div class="TaskForm">
    <div class="flex">
      <VSelect
        v-if="modelValue.stageId"
        :model-value="stage" :options="stages"
        :disabled="disabled || mode === 'view'"
        @update:model-value="$emit('update:modelValue', { ...modelValue, id: $event.id })"
      >
        <template #default="{ item }">
          <div class="flex items-center gap-1 px-1">
            <div class="rounded-full w-3 h-3 shrink-0" :style="{ backgroundColor: item.color || 'white' }" />
            <div class="">
              {{ item.name }}
            </div>
          </div>
        </template>
      </VSelect>
    </div>
    <div class="TaskForm__content-wrapper">
      <textarea
        :value="modelValue.content" class="TaskForm__content-edit"
        :class="{ invisible: (mode === 'view' || disabled) }"
        name="content"
        :disabled="disabled"
        @input="$emit('update:modelValue', { ...modelValue, content: ($event.target as HTMLTextAreaElement).value })"
      />
      <div class="TaskForm__content" :class="{ invisible: (mode !== 'view') }">
        {{ modelValue.content }}
      </div>
    </div>
    <label>
      {{ t('project.tags') }}:
      <VTags
        :model-value="modelValue.tags"
        :color="true"
        :max-length="10"
        :disabled="disabled || mode === 'view'"
        @update:model-value="$emit('update:modelValue', { ...modelValue, tags: $event })"
      />
    </label>
  </div>
</template>

<style>
.TaskForm {
  display: grid;
  grid-template-rows: min-content 1fr min-content;
  grid-auto-rows: min-content;
  gap: 1rem;
}

.TaskForm__header {
  height: 2rem;
}

.TaskForm__edit-buttons {
  display: flex;
}

.TaskForm__content {
  resize: none;
  overflow: auto;
  width: 100%;
  height: 100%;
  border: 2px solid var(--color-input-border);
}

.TaskForm__content:focus {
  border: 2px solid var(--color-input-focus-border)
}

.TaskForm__content:disabled {
  background: transparent;
}

.TaskForm .VTags input {
  width: 8rem;
}

.TaskForm .VTags input:disabled {
  opacity: 0;
}

.TaskForm .VTags__list:empty::before {
  content: '---';
  margin: 0 .25rem;
}

.TaskForm .VSelect,
.TaskForm .VSelect__dropdown {
  border: 2px solid;
  border-color: var(--color-input-border);
  border-radius: .6rem;
}

.TaskForm .VSelect:focus,
.TaskForm .VSelect--open,
.TaskForm .VSelect__dropdown {
  border-color: var(--color-input-focus-border);
}
.TaskForm .VSelect.VSelect--disabled:focus {
  border-color: var(--color-input-border);
}
.TaskForm__content-wrapper {
  display: grid;
}
.TaskForm__content,
.TaskForm__content-edit {
  white-space: pre-wrap;
  grid-area: 1 / 1 / 2 / 2;
  resize: none;
  overflow: hidden;
  padding: 0.5rem;
  font: inherit;
}

.TaskForm__content {
  border: 2px solid transparent;
  padding-bottom: 1rem;
}
</style>
