<template>
  <button class="VButton  px-4 py-2 rounded-4">
    <div class="VButton_left-icon">
      <slot name="left" />
    </div>
    <slot />
  </button>
</template>

<style>
.VButton {
  display: inline-grid;
  align-items: center;
  justify-items: center;
  grid-template-columns: min-content auto;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  background-color: var(--color-action-contrast-0);
  color: var(--color-action-0);
  border: 2px solid var(--color-action-0);
  font-weight: 600;
}
.VButton:hover {
  background-color: var(--color-action-0);
  color: var(--color-action-contrast-0);
}
</style>
