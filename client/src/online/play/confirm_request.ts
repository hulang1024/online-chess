export enum ConfirmRequestType {
  /** 和棋 */
  DRAW = 2,
  /** 悔棋 */
  WITHDRAW = 3,
  /** 请求暂停对局 */
  PAUSE_GAME = 4,
  /** 请求继续对局 */
  RESUME_GAME = 5
}

export function toReadableText(type: ConfirmRequestType) {
  return {
    [ConfirmRequestType.DRAW]: '和棋',
    [ConfirmRequestType.WITHDRAW]: '悔棋',
    [ConfirmRequestType.PAUSE_GAME]: '暂停对局',
    [ConfirmRequestType.RESUME_GAME]: '继续对局',
  }[type];
}
