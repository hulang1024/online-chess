<template>
  <div :class="['chess-icon', colorClass]">
    <div class="chess__circle">{{ text }}</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
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
$first-color: #d61200;
$second-color: #3d2e1f;

.chess-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 22px;
  height: 22px;
  border-radius: 100%;
  user-select: none;
  box-shadow: 0px 2px 3px 1px rgb(0, 0, 0, 0.32);
  background: var(--broadside-color, #f4d19a);

  .chess__circle {
    position: relative;
    top: -1px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    border-radius: 100%;
    border: 1px solid;
    background: var(--background, #f8e2bf);
    pointer-events: none;
    font-family: 'founder-simli';
    font-size: small;
  }

  &.red {
    color: var(--first-color, $first-color);
    border-color: var(--first-color, $first-color);
  }

  &.black {
    color: var(--second-color, $second-color);
    border-color: var(--second-color, $second-color);
  }
}
</style>
