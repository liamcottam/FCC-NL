import Vuex from 'vuex';

export default new Vuex.Store({
  name: 'auth',
  state: {
    authenticated: localStorage.getItem('access_token') !== null,
  },
  mutations: {
    setAuthenticated(state, value) {
      state.authenticated = value; // eslint-disable-line no-param-reassign
    },
  },
  getters: {
    userdata: state => state.userdata,
    authenticated: state => state.authenticated,
  },
  actions: {
    onLogin(context, data) {
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('userdata', JSON.stringify(data.userdata));
      context.commit('setAuthenticated', true);
    },
    logout(context) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('userdata');
      context.commit('setAuthenticated', false);
    },
  },
});
