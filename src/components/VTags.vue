<script setup lang="ts">
import { ref, toRefs } from 'vue'
const props = withDefaults(defineProps<{
  modelValue: string[]
  placeholder?: string
  maxLength?: number
  color?: boolean | ((tag: string) => string)
  disabled?: boolean
}>(), { maxLength: 10, color: false, disabled: false })

const emit = defineEmits<{
  (e: 'update:modelValue', tags: string[]): void
}>()

const { modelValue: tags } = toRefs(props)
const newTag = ref('')

function filterTag() {
  if (newTag.value.length > props.maxLength)
    newTag.value = newTag.value.slice(0, props.maxLength)
  newTag.value = newTag.value.replaceAll(' ', '')
}

function createTag() {
  if (!newTag.value)
    return
  const newTags = [...tags.value, newTag.value]
  emit('update:modelValue', newTags)

  newTag.value = ''
}

function deleteTag(i: number) {
  const newTags = tags.value.filter((_, index) => index !== i)
  emit('update:modelValue', newTags)
}

function tagToColor(tag: string): string {
  if (!props.color)
    return 'currentColor'

  if (typeof props.color === 'function')
    return props.color(tag)
  let c = 0
  for (let i = 0; i < tag.length; i++)
    c += (tag.charCodeAt(i) * 25214903917 + 11) % (1 << 48)

  c %= 360
  return `hsl(${c + 90}deg, 50%, 50%)`
}
</script>

<template>
  <div class="VTags">
    <div class="VTags__list">
      <div v-for="(tag, i) in tags" :key="i" class="VTags__tag">
        <slot :tag="tag" :index="i">
          <div class="VTags__item font-bold" :style="{ color: tagToColor(tag) }">
            #{{ tag }}
            <div class="VTags__delete-button theme-danger relative w-4">
              <div v-if="!disabled" i="carbon-close-filled" class="w-4 h-4" @click="deleteTag(i)" />
            </div>
          </div>
        </slot>
      </div>
    </div>
    <input
      v-model="newTag" type="text" class="VTags__input inline-block"
      :placeholder="placeholder" :disabled="disabled" @input="filterTag" @change="createTag"
    >
  </div>
</template>

<style>
.VTags {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

.VTags__list {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

.VTags__input {
  padding: .25rem .5rem;
}

.VTags__item {
  display: flex;
  align-items: stretch;
}

.VTags__delete-button {
  opacity: 0;
  align-self: center;
}

.VTags__item:hover .VTags__delete-button {
  color: var(--color-action-0);
  opacity: 1;
}
</style>
