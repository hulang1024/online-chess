enum Type {
  /** 认输 */
  WHITE_FLAG = 1,
  /** 和棋 */
  DRAW = 2,
  /** 悔棋 */
  WITHDRAW = 3,
  /** 请求暂停对局 */
  PAUSE_GAME = 4,
  /** 请求继续对局 */
  RESUME_GAME = 5
}

function toReadableText(type: Type) {
  return {
    [Type.WHITE_FLAG]: '认输',
    [Type.DRAW]: '和棋',
    [Type.WITHDRAW]: '悔棋',
    [Type.PAUSE_GAME]: '暂停对局',
    [Type.RESUME_GAME]: '继续对局',
  }[type];
}

export default {
  Type,
  toReadableText,
};
