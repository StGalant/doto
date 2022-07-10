<script>
export default {
  props: {
    options: {
      type: Array,
      required: true,
    },
    modelValue: {
      required: true,
    },
    tabindex: {
      default: 0,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      open: false,
      focusItem: 0,
    }
  },
  computed: {
    currentItem() {
      const i = this.options.findIndex(o => o.id === this.modelValue?.id)
      if (i < 0) {
        console.warn('VSelect: modelValue does not match any option!')
        return 0
      }
      return i
    },
  },
  watch: {
    open() {
      const closeHandler = (e) => {
        if (e.target !== this.$refs.dropdown) {
          this.open = false
          document.removeEventListener('click', closeHandler)
        }
      }

      if (this.open) {
        this.focusItem = this.currentItem
        this.$nextTick(() => {
          this.$refs.dropdown.focus()
          document.addEventListener('click', closeHandler)
        })
      }
      else {
        this.$nextTick(() => {
          this.$refs.wrapper.focus()
        })
      }
    },
  },
  methods: {
    itemSelected(index) {
      if (!this.options[this.focusItem].disabled)
        this.$emit('update:modelValue', this.options[index])

      this.open = false
    },
    focusNext() {
      const f = this.focusItem
      this.focusItem++
      if (this.focusItem >= this.options.length)
        this.focusItem = 0
      while (this.options[this.focusItem].disabled) {
        this.focusItem++
        if (this.focusItem >= this.options.length)
          this.focusItem = 0
        if (this.focusItem === f)
          break
      }
    },
    focusPrev() {
      const f = this.focusItem
      this.focusItem--
      if (this.focusItem < 0)
        this.focusItem = this.options.length - 1
      while (this.options[this.focusItem].disabled) {
        this.focusItem--
        if (this.focusItem < 0)
          this.focusItem = this.options.length - 1
        if (this.focusItem === f)
          break
      }
    },
    onKeyDown(e) {
      switch (e.key) {
        case 'ArrowDown':
          this.focusNext()
          break
        case 'ArrowUp':
          this.focusPrev()
          break
        case 'Escape':
          this.open = false
          break
        case 'Enter':
          this.itemSelected(this.focusItem)
          this.open = false
          break
      }
    },
  },
}
</script>

<template>
  <div
    ref="wrapper" class="VSelect flex flex-col inline-block"
    :tabindex="tabindex"
    :class="{ 'VSelect--open': open }"
    @click.prevent.stop="open = !open"
    @keydown.enter="open = (open ? open : !open)"
  >
    <div class="flex flex-row items-center">
      <div class="w-full h-full px-2 py-1 overflow-hidden whitespace-nowrap">
        <slot :item="options[currentItem]" />
      </div>
      <div :class="open ? 'i-carbon-chevron-up' : 'i-carbon-chevron-down'" />
    </div>

    <div class="relative">
      <div
        v-show="open" ref="dropdown" class="VSelect__dropdown" :tabindex="0"
        @keydown.stop="onKeyDown"
      >
        <ul>
          <li
            v-for="(item, index) in options" ref="menu" :key="item.id" class="VSelect__option cursor-pointer"
            :class="{
              'VSelect__option--current': (index === currentItem),
              'VSelect__option--focus': (index === focusItem),
              'VSelect__option--disabled': item.disabled,
            }" @click.prevent.stop="itemSelected(index)" @mouseenter="focusItem = index"
          >
            <span class="m-0 cursor-pointer"><slot :item="item" /></span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style>
.VSelect {
  cursor: pointer;
}

.VSelect__dropdown {
  position: absolute;
  z-index: 200;
  background-color: var(--color-background);
  width: 100%;
}

.VSelect__dropdown:focus {
  outline: none;
}

.VSelect__option--current {
  background-color: var(--color-action-1);
  color: var(--color-action-contrast-1);
}

.VSelect__option--focus:not(.VSelect__option--current):not(.VSelect__option--disabled) {
  background-color: var(--color-action-2);
  color: var(--color-action-contrast-2);
}

.VSelect__option--disabled {
  background-color: var(--color-background-secondary);
  color: var(--color-text-secondary);
}
</style>
