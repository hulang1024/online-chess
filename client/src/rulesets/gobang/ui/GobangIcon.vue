<template>
  <div class="row">
    <pure-chess-icon :chess="1" />
    <pure-chess-icon
      :chess="2"
      class="right"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import PureChessIcon from './PureChessIcon.vue';

export default defineComponent({
  components: {
    PureChessIcon,
  },
});
</script>

<style scoped>
.right {
  position: relative;
  left: -4px;
}
</style>
