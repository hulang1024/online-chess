import Signal from "src/utils/signals/Signal";

export enum ConfigItem {
  username = 'username',
  password = 'password',
  token = 'token',
  loginAuto = 'login_auto',
  theme = 'theme',
  audioVolume = 'audio_volume',
  audioGameplayEnabled = 'audio_gameplay_enabled',
  desktopNotifyEnabled = 'desktop_notify_enabled',

  // todo: 待组织
  gobangInputMethod = 'gobang.input_method',
  chinesechessChessStatus = 'chinesechess.chess_status',
  chinesechessGoDisplay = 'chinesechess.go_display',
  chinesechessChessDraggable = 'chinesechess.chess_draggable',
}

export default class ConfigManager {
  public changed = new Signal();

  private store: {[key: string]: unknown} = {};

  private loaded = false;

  constructor() {
    this.initDefaults();
    this.load();
    this.loaded = true;
  }

  public load() {
    if (this.loaded) return;

    // todo: 消除硬编码
    [
      'username', 'password', 'token', 'login_auto',
      'theme', 'audio_volume', 'desktop_notify_enabled',
      'audio_gameplay_enabled', 'gobang.input_method',
      'chinesechess.chess_status', 'chinesechess.go_display', 'chinesechess.chess_draggable',
    ].forEach((key) => {
      let val = localStorage.getItem(key);
      if (val == null) {
        return;
      }
      try {
        // eslint-disable-next-line
        val = JSON.parse(val);
        this.set(key, val);
      } catch (e) {
        // eslint-disable-next-line
      }
    });
  }

  public save() {
    // eslint-disable-next-line
    for (let key in this.store) {
      localStorage.setItem(key, JSON.stringify(this.store[key]));
    }
  }

  public set(key: string, value: unknown) {
    this.store[key] = value;
    this.changed.dispatch(key, value);
  }

  public get(key: string) {
    return this.store[key];
  }

  private initDefaults() {
    this.set(ConfigItem.username, '');
    this.set(ConfigItem.password, '');
    this.set(ConfigItem.token, '');
    this.set(ConfigItem.loginAuto, true);
    this.set(ConfigItem.audioVolume, 0.2);
    this.set(ConfigItem.audioGameplayEnabled, true);
    this.set(ConfigItem.desktopNotifyEnabled, false);
    this.set(ConfigItem.chinesechessChessStatus, true);
    this.set(ConfigItem.chinesechessGoDisplay, true);
    this.set(ConfigItem.chinesechessChessDraggable, false);
    this.set(ConfigItem.theme, 'default');
  }
}
