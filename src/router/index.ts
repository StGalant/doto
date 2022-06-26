import { createWebHistory } from 'vue-router'
import Error404 from '~/pages/error404.vue'
import About from '~/pages/About.vue'
import Home from '~/pages/Home.vue'
import Login from '~/pages/Login.vue'
import Projects from '~/pages/Projects.vue'

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects,
  },
  {
    path: '/about',
    name: 'About',
    component: About,
  },
  {
    path: '/:pathMatch(.*)',
    component: Error404,
    meta: { layout: '404' },
  },
]

export const routerOptions = {
  scrollBehavior: () => ({ left: 0, top: 0 }),
  history: createWebHistory(),
}
