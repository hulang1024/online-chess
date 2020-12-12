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
import { computed, defineComponent, ref } from "@vue/composition-api";

export enum TimerState {
  TICKING,
  PAUSED,
  END
}

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
  setup(props) {
    // 用户设置的计时总时间
    const totalSeconds = ref<number>(props.totalSeconds);
    // 计时当前秒数
    const _seconds = ref<number>(totalSeconds.value);
    // 计算显示
    const displayMinutes = computed(() => (totalSeconds.value === null ? '--' : padZero(Math.floor(_seconds.value / 60))));
    const displaySeconds = computed(() => (totalSeconds.value === null ? '--' : padZero(_seconds.value % 60)));
    const secondsColor = computed(() => {
      const sec = _seconds.value;
      if (!sec) return '';// 包括了0和null
      if (sec < totalSeconds.value / 4) return 'red';
      if (sec < totalSeconds.value / 2) return 'orange';
      return '';
    });

    let onEndAction: () => void;
    let timerState: TimerState | null = null;
    let timer: NodeJS.Timeout;

    // 设置计时时间
    const setTotalSeconds = (seconds: number | null) => {
      totalSeconds.value = seconds as number;
    };

    const setOnEnd = (callback: () => void) => {
      onEndAction = callback;
    };

    // 开始(继续)计时
    const _tick = () => {
      clearInterval(timer);
      timerState = TimerState.TICKING;
      timer = setInterval(() => {
        if (_seconds.value - 1 <= 0) {
          _seconds.value = 0;
          timerState = TimerState.END;
          clearInterval(timer);
          onEndAction();
          return;
        }
        _seconds.value--;
      }, 1000);
    };

    // 准备开始，显示总计时
    const ready = (seconds?: number) => {
      timerState = null;
      setTotalSeconds(seconds || null);
      _seconds.value = totalSeconds.value;
    };

    // 重新计时
    const restart = () => {
      _seconds.value = totalSeconds.value;
      _tick();
    };

    const start = restart;

    // 暂停计时
    const pause = () => {
      if (timerState === TimerState.PAUSED) {
        return;
      }
      timerState = TimerState.PAUSED;
      clearInterval(timer);
    };

    // 暂停后恢复计时
    const resume = () => {
      if (timerState === TimerState.END || timerState === TimerState.TICKING) {
        return;
      }
      _tick();
    };

    const stop = () => {
      clearInterval(timer);
      timerState = null;
    };

    const isReady = () => timerState === null || timerState === TimerState.END;
    const isEnd = () => timerState === TimerState.END;

    return {
      displayMinutes,
      displaySeconds,
      secondsColor,

      isEnd,
      isReady,
      setTotalSeconds,
      setOnEnd,
      ready,
      start,
      restart,
      pause,
      stop,
      resume,
    };
  },
});
</script>

<style lang="sass" scoped>
.timer
  display: inline-block

</style>
