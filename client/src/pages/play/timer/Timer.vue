<template>
  <div class="timer">
    <span class="time">{{ displayMinutes }}</span>
    <span>:</span>
    <span
      class="time"
      :class="`text-${secondsColor}`"
    >{{ displaySeconds }}</span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import Timer from "./Timer";

function padZero(n: number) {
  return n < 10 ? `0${n}` : n;
}

export default defineComponent({
  props: {
    totalSeconds: {
      type: Number,
      default: null,
    },
  },
  setup(props, { emit }) {
    const timer = new Timer(emit);
    // 计算显示
    const displayMinutes = computed(() => (timer.totalSeconds.value === null ? '--' : padZero(Math.floor(timer.seconds.value / 60))));
    const displaySeconds = computed(() => (timer.totalSeconds.value === null ? '--' : padZero(timer.seconds.value % 60)));
    const secondsColor = computed(() => {
      const sec = timer.seconds.value;
      if (!sec) return '';// 包括了0和null
      if (sec < timer.totalSeconds.value / 4) return 'red';
      if (sec < timer.totalSeconds.value / 2) return 'orange';
      return '';
    });

    return {
      displayMinutes,
      displaySeconds,
      secondsColor,

      ready: timer.ready.bind(timer),
      start: timer.start.bind(timer),
      restart: timer.restart.bind(timer),
      pause: timer.pause.bind(timer),
      stop: timer.stop.bind(timer),
      resume: timer.resume.bind(timer),
      setTotalSeconds: timer.setTotalSeconds.bind(timer),
      getTotalSeconds: timer.getTotalSeconds.bind(timer),
      setCurrent: timer.setCurrent.bind(timer),
      getCurrent: timer.getCurrent.bind(timer),
    };
  },
});
</script>

<style lang="sass" scoped>
.timer
  display: inline-block

</style>
