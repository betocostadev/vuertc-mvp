import Vue from 'vue'
import VueRouter from 'vue-router'
import Streamer from '../views/Streamer.vue'

Vue.use(VueRouter)

const routes = [{
    path: '/',
    name: 'Streamer',
    component: Streamer
  },
  {
    path: '/peers',
    name: 'Peers',

    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.

    component: () =>
      import( /* webpackChunkName: "about" */ '../views/Peers.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router