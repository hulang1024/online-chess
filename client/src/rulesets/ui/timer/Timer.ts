import { onUnmounted, ref } from "vue";
import GameAudio from "../../GameAudio";

export enum TimerState {
  TICKING,
  PAUSED,
  END
}

export default class Timer {
  // 用户设置的计时总时间
  public readonly totalSeconds = ref<number>(0);

  // 计时当前秒数
  public readonly seconds = ref<number>(0);

  private _state = ref<TimerState | null>(null);

  public get state() {
    return this._state;
  }

  private timer: NodeJS.Timeout;

  private starts = 0; // 启动次数

  private soundEnabled = false;

  private emit: (event: string, ...args: any[]) => void;

  constructor(emit: (event: string, ...args: any[]) => void) {
    this.emit = emit;

    onUnmounted(() => {
      clearInterval(this.timer);
    });
  }

  public getTotalSeconds() {
    return this.totalSeconds.value;
  }

  /** 设置计时时间 */
  public setTotalSeconds(seconds: number | null) {
    this.totalSeconds.value = seconds as number;
    this.emit('totalSecondsSet', this.totalSeconds.value);
  }

  /** 准备开始，显示总计时，并重置启动次数 */
  public ready(current?: number) {
    this._state.value = null;
    this.starts = 0;
    this.seconds.value = current || this.totalSeconds.value;
    this.emit('ready', this.seconds.value);
  }

  /** 重置为总时，重新计时 */
  public restart() {
    this.emit('restarted');
    this.seconds.value = this.totalSeconds.value;
    this.starts++;
    this.tick();
  }

  /** 重新计时或是从当前计时 */
  public start() {
    // 第一次之后才重新计时
    if (this.starts > 0) {
      this.restart();
    } else {
      this.emit('started');
      this.starts++;
      // 使用当前值计时
      this.tick();
    }
  }

  public getCurrent() { return this.seconds.value; }

  public setCurrent(time: number) {
    this.seconds.value = time;
  }

  public setSoundEnabled(b: boolean) {
    this.soundEnabled = b;
  }

  /** 暂停计时 */
  public pause() {
    if (this._state.value === TimerState.PAUSED) {
      return;
    }
    this._state.value = TimerState.PAUSED;
    clearInterval(this.timer);
    this.emit('paused');
  }

  /** 暂停后恢复计时 */
  public resume() {
    if (this._state.value === TimerState.END
      || this._state.value === TimerState.TICKING) {
      return;
    }
    this.tick();
    this.emit('resumed');
  }

  public stop() {
    clearInterval(this.timer);
    this._state.value = null;
    this.emit('stoped');
  }

  private tick() {
    clearInterval(this.timer);
    this._state.value = TimerState.TICKING;
    this.timer = setInterval(() => {
      if (this.seconds.value - 1 <= 0) {
        this.seconds.value = 0;
        this._state.value = TimerState.END;
        clearInterval(this.timer);
        this.emit('ended');
        return;
      }
      this.seconds.value--;

      // 声音
      if (this.soundEnabled && this.seconds.value <= 10) {
        const start = Math.ceil(this.totalSeconds.value / 3);
        if (this.seconds.value <= start) {
          GameAudio.play(`gameplay/count/zh/${this.seconds.value}`);
          this.emit('downcount-started');
        }
      }
    }, 1000);
  }
}
