package io.github.hulang1024.chess.play.rule;

public enum GameResult {
    DRAW(0),
    WIN(1),
    LOSE(2);

    int code;

    GameResult(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    public static GameResult from(int code) {
        for (GameResult item : GameResult.values()) {
            if (code == item.getCode()) {
                return item;
            }
        }
        return null;
    }
}