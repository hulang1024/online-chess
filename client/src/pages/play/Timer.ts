export default interface Timer {
  isEnd: () => boolean,
  isReady: () => boolean,
  setTotalSeconds: (s: number | null) => void,
  setOnEnd: (cb: () => void) => void,
  ready: (totalSeconds?: number) => void,
  start: () => void,
  restart: () => void,
  pause: () => void,
  stop: () => void,
  resume: () => void
}
