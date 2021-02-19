package io.github.hulang1024.chess.play;

public enum ConfirmRequestType {
    /** 认输 */
    WHITE_FLAG(1),
    /** 和棋 */
    DRAW(2),
    /** 悔棋 */
    WITHDRAW(3),

    /** 请求暂停游戏 */
    PAUSE_GAME(4),

    /** 请求继续游戏 */
    RESUME_GAME(5);

    private int code;

    ConfirmRequestType(int code) {
        this.code = code;
    }

    public int code() {
        return this.code;
    }
}