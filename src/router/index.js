import Vue from 'vue'
import VueRouter from 'vue-router'
const ScreenPage = () => import("@/views/ScreenPage")

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: "/screen"
  },
  {
    path: "/screen",
    component: ScreenPage
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

export default router
