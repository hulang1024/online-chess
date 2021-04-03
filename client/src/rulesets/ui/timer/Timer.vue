<template>
  <div
    :class="['timer', {ticking: state == 0 || state == 2}, color]"
  >
    <digit
      v-for="(c, i) in displayMinutes.split('')"
      :key="i"
      :digit="+c"
    />
    <span class="separator">:</span>
    <digit
      v-for="(c, i) in displaySeconds.split('')"
      :key="i + 6"
      :digit="+c"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "@vue/composition-api";
import Digit from "./Digit.vue";
import Timer from "./Timer";

function padZero(n: number) {
  return n < 10 ? `0${n}` : n.toString();
}

export default defineComponent({
  components: { Digit },
  props: {
    lazy: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const timer = new Timer(emit);
    const { totalSeconds, seconds } = timer;
    // 计算显示
    const displayMinutes = computed(() => (totalSeconds.value === null ? '--' : padZero(Math.floor(seconds.value / 60))));
    const displaySeconds = computed(() => (totalSeconds.value === null ? '--' : padZero(seconds.value % 60)));
    const color = computed(() => {
      const sec = seconds.value;
      if (!sec) return 'red';// 包括了0和null
      if (sec < totalSeconds.value / 4) return 'red';
      if (!props.lazy && sec < totalSeconds.value / 2) return 'orange';
      return 'green';
    });

    return {
      displayMinutes,
      displaySeconds,
      color,

      state: timer.state,
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
$drop-shadow: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.6))
$text-shadow: 0 0 6px

.timer
  display: inline-flex
  flex-wrap: nowrap
  user-select: none
  padding: 0px 6px
  background: rgba(0, 0, 0, 0.7)
  font-family: digital
  border-radius: 4px
  transition: color 0.1s, filter 0.1s, text-shadow 0.1s ease-out

  &.green
    color: #76ff03

  &.orange
    color: #ffbb33

  &.red
    color: #ff3333

  &.ticking
    filter: $drop-shadow brightness(1)

    &.green
      text-shadow: $text-shadow #76ff03

    &.orange
      text-shadow: $text-shadow #ffbb33

    &.red
      text-shadow: $text-shadow #ff3333

  &:not(.ticking)
    filter: $drop-shadow brightness(0.8)
    text-shadow: $text-shadow rgba(0, 0, 0, 0)

  .separator
    display: inline-block
    padding: 0px 1px
</style>
