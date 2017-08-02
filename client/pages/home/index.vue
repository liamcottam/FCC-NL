<template>
  <div>
    <h3 class="text-center home-title">Where you headin'?</h3>
    <SearchBar placeholder="Search for bars" :enableGeoLocation="true" v-on:location="onAutocompleteResult" :searchText="getPrevSearch()"></SearchBar>
    <br/>
    <b-list-group v-if="places.length !== 0">
      <b-list-group-item v-for="(item, index) in places" :key="item.id" :title="item.name">
        <div class="col-sm-12">
          <img class="item-image float-sm-left" :src="item.image_url" />
          <p>{{ item.name }}</p>
          <p>{{ (item.snippet) ? item.snippet : 'No summary for this item' }}
            <br/>{{ getDistance(index) }} miles away</p>
          <b-button class="float-sm-right" variant="primary" size="sm" @click="clickItem(item, index)">People Going: {{ item.going }}</b-button>
        </div>
      </b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
import SearchBar from '../../components/SearchBar';

export default {
  data() {
    return {
      prevSearch: null,
      places: [],
    };
  },
  components: { SearchBar },
  created() {
    this.$bus.$on('refreshHome', this.loadData);

    if (this.$store.state.authenticated && this.$route.query.registerInterest) {
      const registerInterest = this.$route.query.registerInterest;
      this.$router.replace({ query: {} });
      this.registerInterest(registerInterest, true);
    } else {
      this.loadData();
    }
  },
  beforeDestroy() {
    this.$bus.off('refreshHome', this.refreshHome);
  },
  methods: {
    loadData() {
      if (localStorage.getItem('prev_search') !== null) {
        this.prevSearch = JSON.parse(localStorage.getItem('prev_search'));

        this.$axios.get(`api/v1/places?lat=${this.prevSearch.lat}&lng=${this.prevSearch.lng}`)
          .then((response) => {
            this.places = response;
          }).catch((err) => {
            console.error(err);
          });
      }
    },
    getPrevSearch() {
      if (this.prevSearch !== null && this.prevSearch.addr) {
        return this.prevSearch.addr;
      }
      return null;
    },
    onAutocompleteResult(geoData) {
      localStorage.setItem('prev_search', JSON.stringify(geoData));
      this.places = [];
      this.loadData();
    },
    clickItem(item, index) {
      if (this.$store.state.authenticated) {
        this.registerInterest(item.id).then((count) => {
          this.places[index].going = count;
        });
      } else {
        this.$route.meta.redirect = { name: 'home', query: { registerInterest: item.id } };
        this.$router.push({ name: 'login' });
      }
    },
    registerInterest(id, loadData) {
      return new Promise((resolve) => {
        this.$axios.post('api/v1/places', { id }).then((body) => {
          if (loadData) {
            this.loadData();
          }
          resolve(body);
        }).catch((err) => {
          console.error(err);
          this.loadData();
        });
      });
    },
    getDistance(index) {
      const currentPosition = {
        lat: this.prevSearch.lat,
        lng: this.prevSearch.lng,
      };
      const destPosition = {
        lat: this.places[index].lat,
        lng: this.places[index].lng,
      };
      /* eslint-disable */
      const R = 3958.756; // Radius of the Earth in miles
      const dLat = (destPosition.lat - currentPosition.lat) * Math.PI / 180;
      const dLon = (destPosition.lng - currentPosition.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(currentPosition.lat * Math.PI / 180) * Math.cos(destPosition.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;
      return parseFloat(dist.toFixed(2));
    },
  },
};
</script>

<style scoped>
.home-title {
  margin-top: 50px;
  margin-bottom: 25px;
  font-weight: 300;
}

.item-image {
  width: 100px;
  margin-right: 1.25rem;
}

.float-sm-left {
  float: left !important;
}

.float-sm-right {
  float: right !important;
}

.btn-primary:focus,
.btn-primary.focus {
  outline: 0;
  box-shadow: unset;
}
</style>
