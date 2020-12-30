<template>
  <q-circular-progress
    show-value
    instant-feedback
    :max="max"
    :value="current"
    track-color="transparent"
    :thickness="0.1"
    reverse
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
  setup() {
    const timer = new CircleTimer();

    return {
      max: timer.max,
      current: timer.current,
      setSyncTimer: timer.setSyncTimer.bind(timer),
    };
  },
});
</script>
