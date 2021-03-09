package io.github.hulang1024.chess.games;

public enum GameType {
    chinesechess(1),
    chinesechessDark(3),
    gobang(2),
    reversi(4);

    int code;

    GameType(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    public static GameType from(int code) {
        for (GameType type : GameType.values()) {
            if (type.getCode() == code) {
                return type;
            }
        }
        return null;
    }
}