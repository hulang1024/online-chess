import TWEEN from "tween.ts";

export default class TweenAnimationUpdater {
  private static animationId: number;

  public static start() {
    const animate = (time: number) => {
      this.animationId = requestAnimationFrame(animate);
      TWEEN.update(time);
    };
    this.animationId = requestAnimationFrame(animate);
  }

  public static stop() {
    cancelAnimationFrame(this.animationId);
  }
}
