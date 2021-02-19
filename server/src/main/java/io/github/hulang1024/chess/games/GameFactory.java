package io.github.hulang1024.chess.games;

import io.github.hulang1024.chess.games.chinesechess.ChineseChessGame;
import io.github.hulang1024.chess.games.gobang.GobangGame;

public final class GameFactory {
    public static Game create(GameType type) {
        switch (type) {
            case chinesechess:
                return new ChineseChessGame();
            case gobang:
                return new GobangGame();
            default:
                return null;
        }
    }
}