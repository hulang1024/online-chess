package io.github.hulang1024.chinesechessserver.domain.chinesechess.rule;

/**
 * 棋方
 */
public enum ChessHost {
    RED(1),
    BLACK(2);
    
    private int code;

    ChessHost(int code) {
        this.code = code;
    }

    public int code() {
        return this.code;
    }

    public ChessHost reverse() {
        return this == RED ? BLACK : RED;
    }

    public static ChessHost fromCode(int code) {
        return code == 1 ? RED : BLACK;
    }
}
