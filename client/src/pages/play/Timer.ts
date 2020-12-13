export default interface Timer {
  setTotalSeconds: (s: number | null) => void,
  setOnEnd: (cb: () => void) => void,
  ready: (current?: number) => void,
  start: () => void,
  restart: () => void,
  pause: () => void,
  stop: () => void,
  resume: () => void,
  getCurrent: () => number,
  setCurrent: (time: number) => void,
}
