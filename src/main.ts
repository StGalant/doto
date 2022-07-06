import { ViteSSG } from 'vite-ssg'
import { setupLayouts } from 'virtual:generated-layouts'
import App from './App.vue'
import { useAppInit } from './composables/useAppInit'
// import { authInit } from './api'
import { routes as _routes } from '~/router'

import '@unocss/reset/tailwind.css'
import './styles/main.css'
import 'uno.css'

const { initialized } = useAppInit()
initialized.value = false

const routes = setupLayouts(_routes)

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.globEager('./modules/*.ts')).forEach(i => i.install?.(ctx))
  },
)

