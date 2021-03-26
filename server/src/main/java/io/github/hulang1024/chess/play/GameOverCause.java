package io.github.hulang1024.chess.play;

public enum GameOverCause {
    NORMAL(1),
    DRAW(2),
    WHITE_FLAG(3),
    TIMEOUT(4);

    private int code;

    GameOverCause(int code) {
        this.code = code;
    }

    public int code() {
        return this.code;
    }

    public static GameOverCause from(int code) {
        for (GameOverCause item : GameOverCause.values()) {
            if (code == item.code()) {
                return item;
            }
        }
        return null;
    }
}