enum Type {
    /** 认输 */
    WHITE_FLAG = 1,
    /** 和棋 */
    DRAW = 2,
    /** 悔棋 */
    WITHDRAW = 3
}

function toReadableText(type: Type) {
    return {
        [Type.WHITE_FLAG]: '认输',
        [Type.DRAW]: '和棋',
        [Type.WITHDRAW]: '悔棋'
    }[type];
}

export default {
    Type,
    toReadableText
}