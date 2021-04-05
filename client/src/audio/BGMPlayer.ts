import { audioManager, configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";

function isEnable() {
  return configManager.get(ConfigItem.audioEnabled) && configManager.get(ConfigItem.bgmEnabled);
}

export default class BGMPlayer {
  private readonly audio = audioManager.samples.get('gameplay_bgm');

  constructor() {
    this.audio.src = '/audio/bgm/gaoshanliushui.mp3';
    this.audio.loop = true;

    configManager.changed.add((key: string) => {
      if (!(key == ConfigItem.audioEnabled || key == ConfigItem.bgmEnabled)) {
        return;
      }
      if (isEnable()) {
        if (this.audio.paused) {
          this.audio.currentTime = 0;
          // eslint-disable-next-line
          this.audio.play();
        }
      } else {
        this.audio.pause();
      }
    });

    document.addEventListener('click', () => {
      if (isEnable()) {
        this.play();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (isEnable()) {
        if (document.hidden) {
          this.audio.pause();
        } else {
          // eslint-disable-next-line
          this.play();
        }
      }
    });
  }

  private play() {
    if (!this.audio.paused) {
      return;
    }
    // eslint-disable-next-line
    this.audio.play();
  }
}
