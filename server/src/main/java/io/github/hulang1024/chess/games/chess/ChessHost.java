package io.github.hulang1024.chess.games.chess;

/**
 * 棋方
 */
public enum ChessHost {
    FIRST(1),
    SECOND(2);

    private int code;

    ChessHost(int code) {
        this.code = code;
    }

    public int code() {
        return this.code;
    }

    public ChessHost reverse() {
        return this == FIRST ? SECOND : FIRST;
    }

    public static ChessHost from(int code) {
        switch (code) {
            case 1: return FIRST;
            case 2: return SECOND;
            default: return null;
        }
    }
}