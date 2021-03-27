<template>
  <chess-icon
    :color="chess"
    :text="text"
  />
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@vue/composition-api';
import ChessHost from 'src/rulesets/chess_host';
import ChessIcon from './ChessIcon.vue';

export default defineComponent({
  components: { ChessIcon },
  props: {
    chess: Number as PropType<ChessHost | undefined>,
  },
  setup(props) {
    const text = computed(() => (props.chess == 1 ? '帅' : '将'));
    return {
      text,
    };
  },
});
</script>
