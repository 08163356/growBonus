import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory('/growbonus/'),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    // 孩子端
    {
      path: '/child',
      name: 'childHome',
      component: () => import('../views/child/ChildHome.vue'),
      meta: { roles: ['child'] },
    },
    {
      path: '/child/achievements',
      name: 'achievements',
      component: () => import('../views/child/AchievementWall.vue'),
      meta: { roles: ['child'] },
    },
    {
      path: '/child/shop',
      name: 'shop',
      component: () => import('../views/child/PrizeShop.vue'),
      meta: { roles: ['child'] },
    },
    // 大人端
    {
      path: '/admin',
      name: 'scoreEntry',
      component: () => import('../views/admin/ScoreEntry.vue'),
      meta: { roles: ['admin', 'parent', 'guest'] },
    },
    {
      path: '/admin/manage',
      name: 'manage',
      component: () => import('../views/admin/ManageCenter.vue'),
      meta: { roles: ['admin', 'parent', 'guest'] },
    },
    {
      path: '/admin/report',
      name: 'report',
      component: () => import('../views/admin/GrowthReport.vue'),
      meta: { roles: ['admin', 'parent', 'guest'] },
    },
    // 默认重定向
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.name === 'login') {
    if (authStore.isLoggedIn) {
      next(authStore.isChild ? '/child' : '/admin')
    } else {
      next()
    }
    return
  }

  if (!authStore.isLoggedIn) {
    next('/login')
    return
  }

  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && !requiredRoles.includes(authStore.user!.role)) {
    // Guest and adults go to admin, children go to child
    next(authStore.isChild ? '/child' : '/admin')
    return
  }

  next()
})

export default router
