export default class SampleStore {
  private readonly sampleCache: { [name: string]: HTMLAudioElement } = {};

  constructor() {
    setTimeout(() => {
      this.loadAll();
    }, 0);
  }

  public get(name: string): HTMLAudioElement {
    const key = name.lastIndexOf('.') > -1 ? name.substring(0, name.lastIndexOf('.')) : name;
    let audio = this.sampleCache[key];
    if (audio) {
      return audio;
    }

    audio = new Audio();
    audio.src = `/audio/${name}${name.lastIndexOf('.') > -1 ? '' : '.wav'}`;
    audio.load();

    this.sampleCache[key] = audio;

    return audio;
  }

  public adjustVolumne(volume: number) {
    Object.keys(this.sampleCache).forEach((name) => {
      this.sampleCache[name].volume = volume;
    });
  }

  private loadAll() {
    const names = [
      'room/user_join', 'room/user_left', 'room/unready', 'room/ready',
      'new_invitation',
      'gameplay/started.mp3',
      'games/gobang/chess_down1.mp3',
    ];
    for (let count = 1; count <= 10; count++) {
      names.push(`gameplay/count/zh/${count}.mp3`);
    }

    ['chess_move', 'eat', 'checkmate', 'checkmate_die'].forEach((name) => {
      names.push(`games/chinesechess/default/${name}.wav`);
    });

    names.forEach((name) => {
      this.get(name);
    });
  }
}
