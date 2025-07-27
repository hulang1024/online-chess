<template>
  <q-circular-progress
    show-value
    instant-feedback
    :max="max"
    :value="current"
    track-color="transparent"
    :thickness="0.2"
    reverse
    v-bind="$attrs"
    class="circle-timer"
    :class="blink || blinkState ? 'blink-start1' : 'blink-pause1'"
  >
    <slot />
  </q-circular-progress>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CircleTimer from "./CircleTimer";

export default defineComponent({
  props: {
    blink: Boolean,
  },
  setup() {
    const timer = new CircleTimer();

    return {
      max: timer.max,
      current: timer.current,
      blinkState: timer.blinkState,
      setSyncTimer: timer.setSyncTimer.bind(timer),
    };
  },
});
</script>

<style scoped>
.circle-timer.blink-start >>> .q-circular-progress__circle {
  animation-play-state: running;
  animation: blink 0.2s linear 0s infinite;
}

.circle-timer.blink-pause >>> .q-circular-progress__circle {
  animation-play-state: paused;
  opacity: 1;
}

@keyframes blink {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
