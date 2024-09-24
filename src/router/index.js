/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import {createRouter, createWebHistory} from 'vue-router/auto'
import {setupLayouts} from 'virtual:generated-layouts'
// import {routes} from 'vue-router/auto-routes'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/index.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/profile.vue')
  },
  {
    path: "/admin",
    name: 'admin',
    component: () => import('@/pages/admin.vue')
  },
  {
    path: '/admin/:id',
    name: 'edit-quiz',
    component: () => import('@/pages/edit_quiz.vue')
  },
  {
    path: '/admin/:id/:questionId',
    name: 'edit-question',
    component: () => import('@/pages/edit_question.vue')
  },
  {
    path: '/admin/new',
    name: 'new-quiz',
    component: () => import('@/pages/new_quiz.vue')
  },
  {
    path: '/quiz/:id',
    name: 'quiz',
    component: () => import('@/pages/quiz.vue')
  }, {
    path: '/join/:id',
    name: 'join',
    component: () => import('@/pages/join.vue')
  }, {
    path: '/admin/:id/join-requests',
    name: 'join-requests',
    component: () => import("@/pages/pending_requests.vue")
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), routes//: setupLayouts(routes),
})

router.beforeEach(async (to, from) => {
  let authenticated = localStorage.getItem("authorized");
  console.log({authenticated})
  if (authenticated) {
    if (to.name === 'login' || to.name === 'signup' || to.name === 'reset-password' || to.name === 'forgot-password') {
      return {name: 'home'}
    }
  } else {
    if (to.name === 'profile' || to.name === 'game') {
      return {name: 'login'}
    }
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})
export default router
