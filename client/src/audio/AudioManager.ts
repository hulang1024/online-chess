import Bindable from "src/utils/bindables/Bindable";
import SampleStore from "./SampleStore";

export default class AudioManager {
  private _samples: SampleStore;

  public get samples() { return this._samples; }

  public readonly volume = new Bindable<number>();

  constructor() {
    this._samples = new SampleStore();
    this.volume.addAndRunOnce((value) => {
      this._samples.adjustVolumne(value);
    });
  }
}
