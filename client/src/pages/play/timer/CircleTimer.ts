import { onBeforeUnmount, ref } from "@vue/composition-api";
import Timer from "./Timer";

export default class CircleTimer {
  public current = ref(100);

  public totalMS = ref(0);

  private startTime = 0;

  private animationId: number;

  constructor() {
    onBeforeUnmount(() => {
      cancelAnimationFrame(this.animationId);
    });
  }

  public setSyncTimer(timer: Timer) {
    const timerComponent = (timer as unknown as Vue);
    timerComponent.$on('readied', (total: number, current: number) => {
      this.totalMS.value = total * 1000;
      this.current.value = current * 1000;
    });
    timerComponent.$on('started', this.start.bind(this));
    timerComponent.$on('paused', this.pause.bind(this));
    timerComponent.$on('resumed', this.resume.bind(this));
    timerComponent.$on('stoped', this.stop.bind(this));
  }

  private start() {
    this.current.value = this.totalMS.value;
    this.startTime = 0;
    this.tick();
  }

  private pause() {
    cancelAnimationFrame(this.animationId);
  }

  private resume() {
    this.tick();
  }

  private stop() {
    cancelAnimationFrame(this.animationId);
    this.current.value = this.totalMS.value;
  }

  private tick() {
    cancelAnimationFrame(this.animationId);
    const update = (now: number) => {
      if (!this.startTime) {
        this.startTime = now;
      }
      this.current.value = this.totalMS.value - (now - this.startTime);
      this.animationId = requestAnimationFrame(update);
    };
    this.animationId = requestAnimationFrame(update);
  }
}
