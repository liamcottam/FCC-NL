import Vue from 'vue';
import VueRouter from 'vue-router';

import { setLoading, setTitle } from '../util/helpers';
import Auth from './auth';
import Home from '../pages/home';
import Login from '../pages/login';

Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        title: 'Home',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: 'Sign In',
        guest: true,
      },
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.meta.auth && !Auth.state.authenticated) {
    next('/login');
    return;
  } else if (to.meta.guest && Auth.state.authenticated) {
    next('/');
    return;
  }

  if (to.hash === '#') {
    next(false);
  } else {
    setLoading(false);
    if (to.meta.title) {
      setTitle(to.meta.title);
    }
    next();
  }
});

export default router;
