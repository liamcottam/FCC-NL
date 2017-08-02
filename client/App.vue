<template>
  <div>
    <a href="https://github.com/you">
      <img style="position: fixed; top: 0; right: 0; border: 0; z-index:1031;" src="https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png">
    </a>
    <b-navbar toggleable type="inverse" variant="inverse" fixed="top">
      <div class="container">
        <b-nav-toggle target="nav_collapse"></b-nav-toggle>
        <b-link class="navbar-brand" to="/" @click.native="onHomeClick" event="''">
          <span>{{ $appName }}</span>
        </b-link>
        <b-collapse is-nav id="nav_collapse">
          <b-nav is-nav-bar>
            <b-nav-item :to="{ name: 'home' }" active-class="active" @click.native="onHomeClick" event="''" exact>Home</b-nav-item>
          </b-nav>
          <b-nav is-nav-bar class="ml-auto">
            <b-nav-item-dropdown right v-if="authenticated && userdata !== null">
              <template slot="button-content">
                <span>{{ userdata.username }}</span>
              </template>
              <b-dropdown-item to="#" @click.prevent="logout">Sign Out</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item :to="{ name: 'login' }" right v-if="!authenticated">Sign In</b-nav-item>
          </b-nav>
        </b-collapse>
      </div>
    </b-navbar>
  
    <div class="container">
      <!-- <keep-alive include="Home"> -->
      <router-view class="router"></router-view>
      <!-- </keep-alive> -->
  
      <div class="loading-container" v-show="isLoading">
        <div class="sk-wave">
          <div class="sk-rect sk-rect1"></div>
          <div class="sk-rect sk-rect2"></div>
          <div class="sk-rect sk-rect3"></div>
          <div class="sk-rect sk-rect4"></div>
          <div class="sk-rect sk-rect5"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      isLoading: false,
      userdata: null,
      title: null,
    };
  },
  created() {
    this.$bus.$on('loadingToggle', (loading) => {
      this.isLoading = loading;
    });

    this.$bus.$on('setTitle', (title) => {
      this.title = title;
    });

    this.$store.watch((state) => {
      if (state.authenticated) {
        this.userdata = JSON.parse(localStorage.getItem('userdata'));
      }
    });
  },
  methods: {
    onHomeClick() {
      const temp = this.$route.path;
      this.$router.push('/');
      this.$bus.emit('refreshHome', temp);
    },
    scrollToTop() {
      window.scrollTo(0, 0);
    },
    logout() {
      this.$store.dispatch('logout');
      if (this.$route.meta.auth) {
        this.$router.push('/login');
      }
    },
  },
  computed: {
    ...mapState([
      'authenticated',
    ]),
  },
};
</script>

<style>
body {
  padding-top: 60px;
  margin-bottom: 1rem;
}

a:focus,
a:hover {
  text-decoration: none;
}

@media (max-width: 575px) {
  .navbar .container {
    margin-left: 0;
    margin-right: 0;
  }
}

.loading-container {
  position: fixed;
  margin-top: -60px;
  margin-left: -25px;
  top: 50%;
  left: 50%;
  user-select: none;
  cursor: default;
}

.alert p {
  margin: 0;
}

.error-template {
  padding: 20px;
  text-align: center;
}

.error-actions {
  margin-top: 20px;
}

.error-actions .btn {
  cursor: pointer;
}

.list-group-item div {
  width: 100%;
}

.list-group-item p {
  margin-bottom: 0;
}
</style>