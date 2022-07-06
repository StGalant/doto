<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    sign: {
      type: String as PropType<'+' | '-' | 'plus' | 'minus'>,
      default: '+',
    },
  },
})
</script>

<template>
  <div class="VPlusMinus">
    <div class="VPlusMinus__horisontal-bar" />
    <div v-if="sign === '+' || sign === 'plus'" class="VPlusMinus__vertical-bar" />
  </div>
</template>

<style>
.VPlusMinus {
  border-radius: 50%;
  position: relative;
  display: grid;
  place-items: center;
}

.VPlusMinus div {
  background-color: currentColor;
}

.VPlusMinus__horisontal-bar {
  width: 100%;
  height: 4px;
  grid-column: 1;
  grid-row: 1;
}

.VPlusMinus__vertical-bar {
  width: 4px;
  height: 100%;
  grid-column: 1;
  grid-row: 1;
}
</style>
