<template>
  <div :class="['chess-icon', colorClass]">
    <div class="chess__circle">{{ text }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api';
import ChessHost from 'src/rulesets/chess_host';

export default defineComponent({
  props: {
    color: Number as PropType<ChessHost>,
    text: String,
  },
  setup(props) {
    const colorClass = computed(() => (props.color == 1 ? 'red' : 'black'));
    return {
      colorClass,
    };
  },
});
</script>

<style lang="scss" scoped>
@import './chess.scss';

.chess-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 22px;
  height: 22px;
  border-radius: 100%;
  user-select: none;
  background: var(--background, #f8e2bf);
  box-shadow:
    0px var(--broadside-shadow-y, 2px) 0px 0px var(--broadside-color, #e5be80),
    0px 2px 3px 1px rgb(0, 0, 0, 0.3);

  .chess__circle {
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    border-radius: 100%;
    border: 1px solid;
    pointer-events: none;
    font-family: 'founder-simli';
    font-size: small;
  }

  &.red {
    color: var(--first-color, $red);
    border-color: var(--first-color, $red);
  }

  &.black {
    color: var(--second-color, $black);
    border-color: var(--second-color, $black);
  }
}
</style>
