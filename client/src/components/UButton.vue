<template>
  <q-btn
    v-bind="$attrs"
    @click="$listeners.click"
  >
    <slot />
  </q-btn>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  inheritAttrs: false,
});
</script>
