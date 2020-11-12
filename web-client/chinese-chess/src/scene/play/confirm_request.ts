


enum Type {
    /** 认输 */
    WHITE_FLAG = 1,
    /** 和棋 */
    DRAW = 2,
    /** 悔棋 */
    WITHDRAW = 3
}

function toReadableText(type: Type) {
    return {1: '认输', 2: '和棋', 3: '悔棋'}[type];
}

export default {
    Type,
    toReadableText
}