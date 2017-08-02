<template>
  <div class="search_container" tabindex="100">
    <button class="search_button" type="submit" v-if="enableGeoLocation" @click="geolocate">
      <span class="search_button_icon">
        <svg viewBox="0 0 24 24">
          <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z">
          </path>
        </svg>
      </span>
    </button>
    <div class="input_container">
      <input ref="input" v-model="inputVal" autocomplete="off" title="Search" :placeholder="placeholder" type="text" @focus="onFocus" @blur="onBlur" @keydown="onKeyDown" @keyup="onKeyUp" @click="onInputClicked" />
    </div>
    <transition name="slide-fade">
      <div class="autocomplete-container" id="autocomplete-container" v-show="hasFocus && autocompleteItems.length > 0" @mouseout="onMouseOut">
        <template v-for="(item, index) in autocompleteItems">
          <div :class="{'autocomplete-item': true, 'active': isActive(index)}" v-bind:key="index" v-on:click="onAutocompleteItemClick(item)" @mouseover="onMouseOver(index)">
            <i class="fa fa-map-marker"></i>
            <strong>{{ item.structured_formatting.main_text }}</strong>
            <small>{{ item.structured_formatting.secondary_text }}</small>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>

<script>
import debounce from 'debounce';

/* eslint-disable no-undef */
export default {
  name: 'searchbar',
  props: {
    placeholder: {
      type: String,
      default: 'Search',
    },
    enableGeoLocation: {
      type: Boolean,
      default: false,
    },
    searchText: {
      type: String,
    },
  },
  data() {
    return {
      prevInputVal: null,
      inputVal: null,
      hasFocus: false,
      autocompleteService: null,
      geocoder: null,
      placesService: null,
      hideAutocompleteItems: true,
      activeItem: null,
      autocompleteText: '',
      autocompleteItems: [],
      delay: 200,
    };
  },
  mounted() {
    this.inputVal = this.searchText;
    this.autocompleteService = new google.maps.places.AutocompleteService();
    this.geocoder = new google.maps.Geocoder();
    this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
    if (this.inputVal === null || this.inputVal.length === 0) {
      this.$refs.input.focus();
    } else {
      this.getAutocompleteItems();
    }
  },
  created() {
    this.onKeyPress = debounce(this.onKeyPress, this.delay);
    this.onLatLng = debounce(this.onLatLng, this.delay);
  },
  methods: {
    onFocus() {
      this.hasFocus = true;
    },
    onBlur(e) {
      if (e.relatedTarget === null) {
        this.hasFocus = false;
      }
    },
    onKeyDown(event) {
      this.prevInputVal = this.$refs.input.value;
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          this.onAutocompleteItemClick(
            this.autocompleteItems[(this.activeItem) ? this.activeItem : 0]);
          this.activeItem = null;
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (this.activeItem === null || this.activeItem === (this.autocompleteItems.length - 1)) {
            this.activeItem = 0;
          } else {
            this.activeItem += 1;
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (this.activeItem === null || this.activeItem === 0) {
            this.activeItem = (this.autocompleteItems.length - 1);
          } else {
            this.activeItem -= 1;
          }
          break;
        case 'Escape':
          this.hasFocus = false;
          this.$refs.input.blur();
          break;
        default:
          break;
      }
    },
    onKeyUp() {
      if (this.prevInputVal !== this.inputVal) {
        this.activeItem = null;
        this.hideAutocompleteItems = false;
        this.prevInputVal = this.inputval;
        this.getAutocompleteItems();
      }
    },
    onInputClicked() {
      this.hideAutocompleteItems = false;
    },
    onMouseOver(index) {
      this.activeItem = index;
    },
    onMouseOut() {
      this.activeItem = null;
    },
    getAutocompleteItems() {
      if (this.inputVal.length >= 1) {
        this.autocompleteService.getPlacePredictions({
          input: this.inputVal,
          /* options: {
            types: ['cities'],
          }, */
        }, (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            this.autocompleteItems = predictions;
          } else {
            this.autocompleteItems = [];
            this.activeItem = null;
          }
        });
      } else {
        this.autocompleteItems = [];
        this.activeItem = null;
      }
    },
    onAutocompleteItemClick(item) {
      this.activeItem = null;
      this.inputVal = item.description;
      this.hasFocus = false;
      this.$refs.input.blur();
      this.geocoder.geocode({ placeId: item.place_id }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          this.returnGeometry(results[0]);
        }
      });
    },
    geolocate() {
      navigator.geolocation.getCurrentPosition((position) => {
        const geolocation = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude,
        );
        this.geocoder.geocode({ location: geolocation }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            this.inputVal = results[0].formatted_address;
            this.autocompleteItems = [];
            this.returnGeometry(results[0]);
          }
        });
      }, (err) => {
        console.error(err); // eslint-disable-line
        alert('Oops, we failed to get your position.'); // eslint-disable-line
      });
    },
    returnGeometry(locationData) {
      const geometry = {
        addr: locationData.formatted_address,
        lat: locationData.geometry.location.lat(),
        lng: locationData.geometry.location.lng(),
      };
      this.$emit('location', geometry);
    },
    calculateDistance(p1, p2) {
      /* eslint-disable */
      if (!p1 || !p2)
        return 0;
      const R = 3958.756; // Radius of the Earth in miles
      const dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
      const dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    isActive(index) {
      if (this.activeItem !== null && this.activeItem === index) {
        return true;
      }
      return false;
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Lato:400,700,400italic");
@import url("https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css");

html {
  font-weight: 300;
  -webkit-font-smoothing: antialiased;
}

.search_container,
.search_container:focus {
  position: relative;
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
  border: honeydew;
  background-color: #fff;
  vertical-align: top;
  outline: none;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.15s ease-in-out;
}

.search_container:hover {
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.search_button {
  background: transparent;
  border: 0;
  float: right;
  margin-top: 1px;
  height: 44px;
  outline: 0;
  padding-right: 16px;
  position: relative;
  top: -1px;
}

.search_button_icon {
  position: relative;
  line-height: 24px;
  display: inline-block;
  height: 24px;
  width: 24px;
  cursor: pointer;
  vertical-align: middle;
  fill: #4285f4;
}

.search_button:focus {
  outline: none;
}

.search_button_icon svg {
  display: block;
  height: 100%;
  width: 100%;
}

.input_container {
  position: relative;
  height: 44px;
  overflow: hidden;
  margin-left: 9px;
  padding: 0 9px;
}

.search_container input {
  height: 34px;
  width: 100%;
  padding: 0;
  margin: 4px 0 0 0;
  line-height: 34px;
  border: none;
  outline: none;
  font: 16px Lato;
  user-select: none;
}

.autocomplete-container {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 1;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08);
  background: #fff;
  outline: none;
  user-select: none;
}

.autocomplete-item {
  line-height: 32px;
  padding: 6px 18px;
  color: #555;
  cursor: pointer;
}

.autocomplete-item span {
  white-space: nowrap;
}

.autocomplete-item.active {
  background: #eee;
}

.autocomplete-item i {
  margin-right: 8px;
}

.slide-fade-enter-active {
  transition: all .3s ease;
}

.slide-fade-leave-active {
  transition: all .1s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
}
</style>
