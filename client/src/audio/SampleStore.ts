export default class SampleStore {
  private readonly sampleCache: { [name: string]: HTMLAudioElement } = {};

  constructor() {
    setTimeout(() => {
      this.loadAll();
    }, 0);
  }

  public get(name: string): HTMLAudioElement {
    let audio = this.sampleCache[name];
    if (audio) {
      return audio;
    }

    audio = new Audio();
    audio.src = `/chinesechess/themes/default/audio/${name}.wav`;
    audio.load();

    this.sampleCache[name] = audio;

    return audio;
  }

  public adjustVolumne(volume: number) {
    Object.keys(this.sampleCache).forEach((name) => {
      this.sampleCache[name].volume = volume;
    });
  }

  private loadAll() {
    for (let count = 1; count <= 10; count++) {
      this.get(`count/${count}`);
    }
    this.get('click');
  }
}
