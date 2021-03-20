<template>
  <div :class="['chess-k-icon', kClass]">
    <div class="circle">{{ text }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api';
import ChessHost from 'src/rulesets/chess_host';

export default defineComponent({
  props: {
    chess: Number as PropType<ChessHost | undefined>,
  },
  setup(props) {
    const text = computed(() => (props.chess == 1 ? '帅' : '将'));
    const kClass = computed(() => (props.chess == 1 ? 'red' : 'black'));
    return {
      text,
      kClass,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './chess.scss';

.chess-k-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 22px;
  height: 22px;
  font-size: 12px;
  font-weight: bold;
  border-radius: 100%;
  user-select: none;
  background: #f8e2bf;
  box-shadow:
    0px 2px 0px 0px #f0c175,
    0px 2px 3px 1px rgb(0, 0, 0, 0.3);

  .circle {
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    border-radius: 100%;
    border: 1px solid;
    pointer-events: none;
  }

  &.red {
    color: $red;
  }

  &.black {
    color: $black;
  }
}
</style>
