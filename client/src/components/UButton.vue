<template>
  <q-btn
    unelevated
    v-bind="$attrs"
    @click="$listeners.click"
  />
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  inheritAttrs: false,
});
</script>
