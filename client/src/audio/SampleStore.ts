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
    audio.src = `/audio/${name}.wav`;
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
    const names = ['room/user_join', 'room/user_left', 'new_invitation', 'gameplay/chess_move'];
    for (let count = 1; count <= 10; count++) {
      names.push(`gameplay/count/${count}`);
    }

    names.forEach((name) => {
      this.get(name);
    });
  }
}
