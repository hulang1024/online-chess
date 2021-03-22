import { configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";

export function allowDesktopNotify(): boolean {
  return 'Notification' in window && Notification.permission == 'granted';
}

export default async function desktopNotify(msg: string): Promise<Notification | null> {
  if (!('Notification' in window) || !configManager.get(ConfigItem.desktopNotifyEnabled)) {
    return null;
  }

  await new Promise((resolve, reject) => {
    if (Notification.permission == 'granted') {
      resolve();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission == 'granted') {
          resolve(null);
        } else {
          reject(null);
        }
      }).catch(() => {
        reject(null);
      });
    } else {
      reject();
    }
  });

  const options = {
    body: msg,
  };

  const notification = new Notification('通知', options);

  return notification;
}

export function requestNotificationPermission() {
  if (!('Notification' in window) || allowDesktopNotify()) {
    return;
  }

  if (!configManager.get(ConfigItem.desktopNotifyEnabled)) {
    Notification.requestPermission().then((permission) => {
      if (permission == 'granted') {
        configManager.set(ConfigItem.desktopNotifyEnabled, true);
      } else {
        configManager.set(ConfigItem.desktopNotifyEnabled, false);
      }
      configManager.save();
    }).catch(() => {
      configManager.set(ConfigItem.desktopNotifyEnabled, false);
      configManager.save();
    });
  } else {
    configManager.set(ConfigItem.desktopNotifyEnabled, false);
    configManager.save();
  }
}
