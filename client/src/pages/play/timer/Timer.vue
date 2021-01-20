<template>
  <div :class="['timer', `text-${color}`]">
    <span class="time">{{ displayMinutes }}</span>
    <span>:</span>
    <span class="time">{{ displaySeconds }}</span>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import Timer from "./Timer";

function padZero(n: number) {
  return n < 10 ? `0${n}` : n;
}

export default defineComponent({
  setup(props, { emit }) {
    const timer = new Timer(emit);
    const { totalSeconds, seconds } = timer;
    // 计算显示
    const displayMinutes = computed(() => (totalSeconds.value === null ? '--' : padZero(Math.floor(seconds.value / 60))));
    const displaySeconds = computed(() => (totalSeconds.value === null ? '--' : padZero(seconds.value % 60)));
    const color = computed(() => {
      const sec = seconds.value;
      if (!sec) return '';// 包括了0和null
      if (sec < totalSeconds.value / 4) return 'red';
      if (sec < totalSeconds.value / 2) return 'orange';
      return '';
    });

    return {
      displayMinutes,
      displaySeconds,
      color,

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
      setSoundEnabled: timer.setSoundEnabled.bind(timer),
    };
  },
});
</script>

<style lang="sass" scoped>
.timer
  display: inline-block

</style>
