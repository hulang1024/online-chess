import { ref } from "@vue/composition-api";
import Timer from "./Timer";

export default class CircleTimer {
  public current = ref(100);

  public setSyncTimer(timer: Timer) {
    const timerComponent = (timer as unknown as Vue);
    timerComponent.$on('totalSecondsChanged', () => {
      this.current.value = 100;
    });
    timerComponent.$on('changed', (value: number) => {
      this.current.value = Math.floor((value / timer.getTotalSeconds()) * 100);
    });
    timerComponent.$on('stoped', () => {
      this.current.value = 100;
    });
  }
}
