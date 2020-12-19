<template>
  <q-circular-progress
    show-value
    font-size="10px"
    class="circle-timer"
    :value="current"
    :thickness="0.1"
    track-color="transparent"
    v-bind="$attrs"
  >
    <slot />
  </q-circular-progress>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import CircleTimer from "./CircleTimer";

export default defineComponent({
  props: {
    totalSeconds: {
      type: Number,
      default: null,
    },
  },
  setup() {
    const timer = new CircleTimer();

    return {
      current: timer.current,
      setSyncTimer: timer.setSyncTimer.bind(timer),
    };
  },
});
</script>
