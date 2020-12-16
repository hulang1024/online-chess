import { audioManager, configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";

export default class GameAudio {
  public static play(name: string) {
    const audio = audioManager.samples.get(`game/${name}`);
    audio.src = `/chinesechess/themes/default/audio/${name}.wav`;
    if (configManager.get(ConfigItem.audioGameEnabled)) {
      // eslint-disable-next-line
      audio.play();
    }
  }
}
