<script lang="ts" setup>
import { useMessagesStore } from '~/store/messages'

const store = useMessagesStore()
</script>

<template>
  <teleport to="body">
    <Transition name="msg-bar">
      <div v-show="store.messages.length" class="VMessages flex justify-center gap-1">
        <TransitionGroup name="message">
          <div
            v-for="m in store.messages"
            :key="m.id" :class="m.className"
            class="flex items-center gap-1 bg-a-0 text-a-c-0 p-2 rounded"
          >
            <div>{{ m.content }}</div><div i="carbon-close" class="text-act-c cursor-pointer" @click="store.deleteMessage(m.id)" />
          </div>
        </TransitionGroup>
      </div>
    </Transition>
  </teleport>
</template>

<style>
  .VMessages {
    position: fixed;
    top: 4px;
    left: 0;
    right: 0;
    height: auto;
    z-index: 10000;
  }

.message-move,
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: scaleY(.1);
}
.message-leave-active {
  position: absolute;
}
</style>
