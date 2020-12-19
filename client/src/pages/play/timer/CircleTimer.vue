<template>
  <q-circular-progress
    show-value
    instant-feedback
    :max="totalMS"
    :value="current"
    track-color="transparent"
    v-bind="$attrs"
    class="circle-timer"
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
      totalMS: timer.totalMS,
      setSyncTimer: timer.setSyncTimer.bind(timer),
    };
  },
});
</script>
