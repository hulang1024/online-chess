<template>
  <div
    v-show="visible"
    class="main-buttons-overlay column justify-center items-center"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    visible: Boolean,
  },
});
</script>

<style lang="sass" scoped>
.main-buttons-overlay
  width: 100%

  .q-btn
    margin: 0px 4px
    width: 100px
    padding: 2px
    font-weight: bold
    letter-spacing: 1px
</style>
