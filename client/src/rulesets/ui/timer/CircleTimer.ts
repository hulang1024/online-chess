import { onBeforeUnmount, ref } from "@vue/composition-api";
import Timer from "./Timer";

export default class CircleTimer {
  public max = ref(0);

  public current = ref(0);

  // 在计时过程中，保证不直接改变max，保存总时
  public totalMS = 0;

  public blinkState = ref(false);

  // 计时开始时间戳
  private startTime = 0;

  // 计时暂停时间戳
  private pauseTime = 0;

  private animationId: number;

  // eslint-disable-next-line
  private listeners: { [name: string]: Function };

  constructor() {
    onBeforeUnmount(() => {
      cancelAnimationFrame(this.animationId);
    });

    this.listeners = {
      totalSecondsSet: (totalS: number) => {
        this.totalMS = totalS * 1000;
      },
      ready: (currentS: number) => {
        this.max.value = this.totalMS;
        this.current.value = currentS * 1000;
      },
      started: this.start.bind(this),
      restarted: this.restart.bind(this),
      'downcount-started': this.startDowncount.bind(this),
      paused: this.pause.bind(this),
      resumed: this.resume.bind(this),
      stoped: this.stop.bind(this),
    };
  }

  public setSyncTimer(timer: Timer) {
    Object.keys(this.listeners).forEach((key) => {
      (timer as unknown as Vue)
        .$off(key, this.listeners[key])
        .$on(key, this.listeners[key]);
    });
  }

  private start() {
    this.max.value = this.totalMS;
    this.startTime = performance.now();
    this.pauseTime = 0;
    this.blinkState.value = false;
    this.tick(this.current.value ? this.totalMS - this.current.value : 0);
  }

  private restart() {
    this.max.value = this.totalMS;
    this.current.value = this.totalMS;
    this.startTime = performance.now();
    this.pauseTime = 0;
    this.blinkState.value = false;
    this.tick();
  }

  private startDowncount() {
    this.blinkState.value = true;
  }

  private pause() {
    cancelAnimationFrame(this.animationId);
    this.pauseTime = performance.now();
    this.blinkState.value = false;
  }

  private resume() {
    this.startTime += (performance.now() - this.pauseTime);
    this.tick();
  }

  private stop() {
    cancelAnimationFrame(this.animationId);
    this.current.value = this.totalMS;
    this.blinkState.value = false;
  }

  private tick(offsetTime = 0) {
    const max = this.max.value;
    const update = (now: number) => {
      this.current.value = max - offsetTime - (now - this.startTime);
      this.animationId = requestAnimationFrame(update);
    };

    cancelAnimationFrame(this.animationId);
    this.animationId = requestAnimationFrame(update);
  }
}
