<template>
  <button class="VButton  px-2 py-1 rounded-4">
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
  background-color: var(--color-background);
  color: var(--color-action-0);
  border: 2px solid var(--color-action-0);
  font-weight: 600;
  transition: background-color .2s ease;
}
.VButton:hover {
  background-color: var(--color-action-0);
  color: var(--color-action-contrast-0);
  text-shadow: 0 0 5px var(--color-border);
}

.VButton[secondary] {
  border-color: transparent;
  color: var(--color-text-secondary);
  background-color: transparent;
}

.VButton[secondary]:hover {
  color: var(--color-action-0);
  text-decoration: underline;
  text-shadow: 0 0 20px var(--color-border);
}
</style>
