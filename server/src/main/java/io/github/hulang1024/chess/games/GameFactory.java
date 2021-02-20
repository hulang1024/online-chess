package io.github.hulang1024.chess.games;

import io.github.hulang1024.chess.games.chinesechess.ChineseChessGame;
import io.github.hulang1024.chess.games.chinesechess.ChineseChessGameSettings;
import io.github.hulang1024.chess.games.gobang.GobangGame;
import io.github.hulang1024.chess.games.gobang.GobangGameSettings;

public final class GameFactory {
    public static Game createGame(GameSettings gameSettings) {
        switch (gameSettings.getGameType()) {
            case chinesechess:
                return new ChineseChessGame((ChineseChessGameSettings) gameSettings);
            case gobang:
                return new GobangGame((GobangGameSettings) gameSettings);
            default:
                return null;
        }
    }

    public static GameSettings createGameSettings(GameType gameType) {
        GameSettings gameSettings = null;
        switch (gameType) {
            case chinesechess:
                gameSettings = new ChineseChessGameSettings();
                break;
            case gobang:
                gameSettings = new GobangGameSettings();
                break;
            default:
                return null;
        }
        gameSettings.setGameType(gameType);

        return gameSettings;
    }
}