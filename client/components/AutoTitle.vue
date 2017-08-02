<template>
  <h1 class="mt-3 text-center header">{{ titleVal }}</h1>
</template>

<script>
import { setTitle } from '../util/helpers';

export default {
  name: 'titlepage',
  props: {
    title: {
      type: String,
    },
  },
  data() {
    return {
      titleVal: null,
    };
  },
  mounted() {
    this.titleVal = (this.title) ? this.title : this.$route.meta.title;
    setTitle(this.titleVal);
  },
};
</script>

<style>
.header {
  padding-bottom: 1.25rem;
  border-bottom: .05rem solid #eee;
  font-weight: 300;
}
</style>
