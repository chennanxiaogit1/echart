import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
// 引入全局样式
import './assets/css/global.less'
// 引入字体样式
import './assets/font/iconfont.css'
import SocketService from '@/utils/socket_service'
// 对服务端进行websocket的连接
const Instance = new SocketService();
Instance.connect()
// 将websocket实例对象挂载在vue上
Vue.prototype.$socket = Instance

// 请求的基准路径的配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
// 将axios挂载在Vue的原型对象上 this.$http
Vue.prototype.$http = axios 

// 将全局的echarts对象挂载  this.$echart
Vue.prototype.$echart = window.echarts

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')
