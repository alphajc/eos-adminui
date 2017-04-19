/**
 * Created by gavin on 3/25/17.
 */
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/font-awesome/css/font-awesome.min.css'
import 'bootstrap';
import Vue from 'vue';
import App from './App';
import router from './router';

Vue.config.productionTip = false;

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
});