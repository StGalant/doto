<script lang="ts" setup>
import { ref } from 'vue'

withDefaults(
  defineProps<{
    modelValue: string
    label: string
    placeholder?: string
    type?: string
  }>(),
  {
    placeholder: ' ',
    type: 'text',
  },
)

const emit = defineEmits<(e: 'update:modelValue', v: string) => void>()

const input = ref<null | HTMLElement>(null)
const focus = () => {
  (input.value as HTMLElement).focus()
}

const emitValue = (e: Event) => {
  emit('update:modelValue', (input.value as HTMLInputElement).value)
}
</script>

<template>
  <div class="VInput rounded" @click="focus">
    <div>
      <slot name="left" />
    </div>
    <div class="relative flex-grow h-full flex flex-row">
      <input ref="input" :type="type" :aria-label="label" :placeholder="placeholder" :value="modelValue" @input="emitValue">
      <div aria-hidden="true" class="VInput__label">
        {{ label }}
      </div>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<style>
.VInput {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  height: 3rem;
  box-shadow: inset 0px 0px 4px -2px rgb(0, 0, 0);
  margin: 0.1rem;
  padding: 0.2rem 0.5rem;
}

.VInput input {
  width: 100%;
  align-self: end;
}

.VInput,
.VInput__label {
  cursor: text;
}

.VInput__label {
  position: absolute;
  display: flex;
  align-items: center;
  width: max-content;
  height: 0.8rem;
  transform: scale(0.8);
  transform-origin: left;
  top: 0;
  opacity: 1;
  transition: height 0.1s, transform 0.1s;
}

.VInput:focus-within {
  box-shadow: inset 0px 0px 2px 1px var(--color-action-0);
}
.VInput:focus-within .VInput__label {
  color: var(--color-action-0);
  opacity: 1;
}

.VInput input:placeholder-shown:not(:focus) ~ .VInput__label {
  color: inherit;
  transform: scale(1);
  opacity: 0.5;
  height: 100%;
}
</style>
