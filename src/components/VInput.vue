<script lang="ts" setup>
import { ref } from 'vue'

withDefaults(
  defineProps<{
    modelValue: string
    label: string
    placeholder?: string
    type?: string
    name?: string
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
  <div class="VInput" @click="focus">
    <div class="VInput__wrapper">
      <slot name="left" />
      <div class="relative flex-grow h-full flex flex-row">
        <input ref="input" :type="type" :aria-label="label" :placeholder="placeholder" :value="modelValue" :name="name" @input="emitValue">
        <div aria-hidden="true" class="VInput__label">
          {{ label }}
        </div>
      </div>
      <slot />
    </div>
  </div>
</template>

<style>
.VInput {
  height: 3rem;
}

.VInput__wrapper {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  height: 100%;
  width: 100%;
}

.VInput input {
  width: 100%;
  align-self: end;
  outline: none;
  margin-bottom: 0.1rem;
  text-align: inherit;
  background-color: inherit;
}
.VInput:active {
  outline: none;
}

.VInput,
.VInput__label {
  cursor: text;
}

.VInput__label {
  position: absolute;
  display: flex;
  align-items: center;
  width: 100%;
  height: 1.6rem;
  transform: scale(0.8);
  transform-origin: left;
  top: 0;
  opacity: 1;
  transition: height 0.1s, transform 0.1s;
}

.VInput[text~="center"] .VInput__label,
.VInput.text-center .VInput__label {
  justify-content: center;
  transform-origin: center;
}

.VInput[text~="right"] .VInput__label,
.VInput.text-right .VInput__label {
  justify-content: right;
  transform-origin: right;
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

.VInput input:autofill ~ .VInput__label {
  transition: none;
}
</style>
