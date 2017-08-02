import Vue from 'vue';
import VueBus from 'vue-bus';
import BootstrapVue from 'bootstrap-vue';
// import * as VueGoogleMaps from 'vue2-google-maps'
// import * as VueGoogleMaps from 'vue2-google-maps';

import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'font-awesome/css/font-awesome.min.css';

import './util/vuex';
import './util/network';
import './util/validator';
import './loading.css';
import router from './util/router';
import store from './util/auth';

import AutoTitle from './components/AutoTitle';

import App from './App';

Vue.use(VueBus);
Vue.use(BootstrapVue);
Vue.component('AutoTitle', AutoTitle);

if (process.env.NODE_ENV !== 'production') {
  Vue.config.debug = true;
}
Vue.config.productionTip = false;

Vue.mixin({
  created() {
    this.$appName = process.env.APP_NAME;
  },
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: {
    AutoTitle,
  },
  store,
  router,
  render: h => h(App),
});
