export function translateDeviceOS(deviceOS: string | undefined): string | undefined {
  const NAME_MAP: {[d: string]: string} = {
    ios: '手机iOS',
    iphone: '手机iPhone',
    android: '手机安卓',
    macos: '电脑MacOS',
    windows: '电脑Windows',
  };
  return deviceOS && (NAME_MAP[deviceOS] || deviceOS);
}
