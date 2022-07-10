<script>
export default {
  props: {
    modelValue: {
      required: true,
    },
    values: {
      type: Array,
      default: () => [true, false],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'checkbox',
    },
  },
  emits: ['update:modelValue'],
  computed: {
    checked() {
      return this.modelValue === this.values[0]
    },
  },
  methods: {
    onClick(ev) {
      if (this.disabled)
        return
      // to make links works within a label
      if (ev.target.tagName !== 'A') {
        ev.preventDefault()
        this.$emit('update:modelValue', this.checked ? this.values[1] : this.values[0])
      }
    },
  },
}
</script>

<template>
  <label
    class="VCheckbox inline-block" :class="{ 'VCheckbox--checked': checked, 'VCheckbox--disabled': disabled }"
    @click="onClick"
  >
    <div class="grid grid-flow-col items-center justify-start gap-1">
      <!-- Custom checkbox -->
      <slot name="checkbox" :checked="checked">
        <div class="VCheckbox__box" role="checkbox" :aria-checked="checked">
          <div class="VCheckbox__check" />
        </div>
      </slot>
      <!-- Label -->
      <slot :checked="checked" />
    </div>
  </label>
</template>

<style>
.VCheckbox__box {
  position: relative;
  width: 1em;
  height: 1em;
  border-radius: 3px;
  box-shadow: inset 0px 0px 3px -1px var(--color-text);
  transition: box-shadow 50ms;

}

.VCheckbox:hover:not(.VCheckbox--checked) .VCheckbox__box {
  box-shadow: inset 0px 0px 3px 1px var(--color-action-0);
}

.VCheckbox__check {
  position: absolute;
  opacity: 0;
  height: 0.35em;
  width: 0.6em;
  border-top-width: 0;
  border-right-width: 0;
  border-left-width: 2px;
  border-bottom-width: 2px;
  border-color: var(--color-action-contrast-0);
  left: 0.45em;
  bottom: 0.25em;
  transform-origin: left bottom;
  transform: rotate(-50deg) scale(0.1);
  transition: transform 150ms;
}

.VCheckbox--disabled {
  filter: grayscale(.7);
}

.VCheckbox--checked .VCheckbox__box {
  box-shadow: inset 0px 0px 0px 2em var(--color-action-0);
}

.VCheckbox--checked .VCheckbox__check {
  opacity: 1;
  transform-origin: left bottom;
  transform: rotate(-50deg) scale(1);
}
</style>
