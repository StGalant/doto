<template>
  <div class="Background fixed inset-0 ">
    <div
      v-for="i in 30" :key="i"
      class="Background__item"
      :style="{
        left: `${Math.random() * 90}%`,
        top: `${Math.random() * 90}%`,
        transform: `scale(${Math.random() + .1}`,
        opacity: `${Math.random() * .12 + .1}`,
      }"
    />
  </div>
</template>

<style>
.Background {
  z-index: -1000;
  filter: blur(4px);
}
.Background__item {
  position: absolute;
  width: 400px;
  height: 400px;
  border: 15px solid rgb(197, 190, 255);
  background-color: var(--color-background);
}
</style>
