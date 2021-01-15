import { audioManager, configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";

export default class GameAudio {
  public static play(name: string) {
    if (!configManager.get(ConfigItem.audioGameEnabled)) {
      return;
    }
    const audio = audioManager.samples.get(`game/${name}`);
    if (!audio.src) {
      audio.src = `/chinesechess/themes/default/audio/${name}.wav`;
    }
    // eslint-disable-next-line
    audio.play();
  }
}
