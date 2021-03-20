<template>
  <div :class="['chess', chess == 1 ? 'black' : 'white']">
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@vue/composition-api';
import ChessHost from 'src/rulesets/chess_host';

export default defineComponent({
  props: {
    chess: Number as PropType<ChessHost | undefined>,
  },
});
</script>

<style lang="scss" scoped>
.chess {
  width: 15px;
  height: 15px;
  border-radius: 100%;
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.1);

  &.white {
    background: white;
  }

  &.black {
    background: black;
  }
}
</style>
