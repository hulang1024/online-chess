import { onBeforeUnmount, ref } from "@vue/composition-api";
import Timer from "./Timer";

export default class CircleTimer {
  public currentMS = ref(0);

  public totalMS = ref(0);

  private startTime = 0;

  private pauseTime = 0;

  private animationId: number;

  constructor() {
    onBeforeUnmount(() => {
      cancelAnimationFrame(this.animationId);
    });
  }

  public setSyncTimer(timer: Timer) {
    const timerComponent = (timer as unknown as Vue);
    timerComponent.$on('readied', (totalS: number, currentS: number) => {
      this.totalMS.value = totalS * 1000;
      this.currentMS.value = currentS * 1000;
    });
    timerComponent.$on('started', this.start.bind(this));
    timerComponent.$on('restarted', this.restart.bind(this));
    timerComponent.$on('paused', this.pause.bind(this));
    timerComponent.$on('resumed', this.resume.bind(this));
    timerComponent.$on('stoped', this.stop.bind(this));
  }

  private start() {
    this.startTime = performance.now();
    this.pauseTime = 0;
    this.tick(this.currentMS.value ? this.totalMS.value - this.currentMS.value : 0);
  }

  private restart() {
    this.currentMS.value = this.totalMS.value;
    this.startTime = performance.now();
    this.pauseTime = 0;
    this.tick();
  }

  private pause() {
    cancelAnimationFrame(this.animationId);
    this.pauseTime = performance.now();
  }

  private resume() {
    this.startTime += (performance.now() - this.pauseTime);
    this.tick();
  }

  private stop() {
    cancelAnimationFrame(this.animationId);
    this.currentMS.value = this.totalMS.value;
  }

  private tick(offsetTime = 0) {
    cancelAnimationFrame(this.animationId);
    const update = (now: number) => {
      this.currentMS.value = this.totalMS.value - offsetTime - (now - this.startTime);
      this.animationId = requestAnimationFrame(update);
    };
    this.animationId = requestAnimationFrame(update);
  }
}
