<template>
  <div
    ref="chessboardContainer"
    class="player column items-center relative-position"
  >
    <slot />
  </div>
</template>
<style lang="sass" scoped>
.player
  flex-grow: 1
  padding: 8px 0px
</style>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({

});
</script>
