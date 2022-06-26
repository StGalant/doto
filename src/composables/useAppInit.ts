import { ref } from 'vue'

const initialized = ref(true)

export function useAppInit() {
  return { initialized }
}
