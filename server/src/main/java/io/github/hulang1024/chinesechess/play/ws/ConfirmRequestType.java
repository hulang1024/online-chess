package io.github.hulang1024.chinesechess.play.ws;

public enum ConfirmRequestType {
    /** 认输 */
    WHITE_FLAG(1),
    /** 和棋 */
    DRAW(2),
    /** 悔棋 */
    WITHDRAW(3);

    private int code;

    ConfirmRequestType(int code) {
        this.code = code;
    }

    public int code() {
        return this.code;
    }
}
