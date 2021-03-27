<template>
  <chess-icon
    v-if="isDarkRule"
    :color="2"
    text="揭"
  />
  <chess-icon
    v-else
    :color="1"
    text="象"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import ChessIcon from './ChessIcon.vue';

export default defineComponent({
  components: { ChessIcon },
  props: {
    isDarkRule: Boolean,
  },
});
</script>
