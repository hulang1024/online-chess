export default class SampleStore {
  private readonly sampleCache: { [name: string]: HTMLAudioElement } = {};

  public get(name: string): HTMLAudioElement {
    let audio = this.sampleCache[name];
    if (audio) {
      return audio;
    }

    audio = new Audio();
    this.sampleCache[name] = audio;

    return audio;
  }

  public adjustVolumne(volume: number) {
    Object.keys(this.sampleCache).forEach((name) => {
      this.sampleCache[name].volume = volume;
    });
  }
}
