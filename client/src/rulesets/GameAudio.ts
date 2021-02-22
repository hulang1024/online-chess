import { audioManager, configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";

export default class GameAudio {
  public static play(name: string) {
    if (name.startsWith('gameplay')
      && !configManager.get(ConfigItem.audioGameplayEnabled)) {
      return;
    }
    const audio = audioManager.samples.get(name);
    // eslint-disable-next-line
    audio.play();
  }
}
