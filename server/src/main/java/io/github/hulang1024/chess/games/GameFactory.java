package io.github.hulang1024.chess.games;

import io.github.hulang1024.chess.games.chinesechess.ChineseChessGame;
import io.github.hulang1024.chess.games.chinesechess.ChineseChessGameSettings;
import io.github.hulang1024.chess.games.chinesechessdark.ChineseChessDarkGame;
import io.github.hulang1024.chess.games.chinesechessdark.ChineseChessDarkGameSettings;
import io.github.hulang1024.chess.games.gobang.GobangGame;
import io.github.hulang1024.chess.games.gobang.GobangGameSettings;
import io.github.hulang1024.chess.games.reversi.ReversiGame;
import io.github.hulang1024.chess.games.reversi.ReversiGameSettings;

public final class GameFactory {
    public static Game createGame(GameSettings gameSettings) {
        switch (gameSettings.getGameType()) {
            case chinesechess:
                return new ChineseChessGame((ChineseChessGameSettings) gameSettings);
            case chinesechessDark:
                return new ChineseChessDarkGame((ChineseChessDarkGameSettings) gameSettings);
            case gobang:
                return new GobangGame((GobangGameSettings) gameSettings);
            case reversi:
                return new ReversiGame((ReversiGameSettings) gameSettings);
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
            case chinesechessDark:
                gameSettings = new ChineseChessDarkGameSettings();
                break;
            case gobang:
                gameSettings = new GobangGameSettings();
                break;
            case reversi:
                gameSettings = new ReversiGameSettings();
            default:
                return null;
        }
        gameSettings.setGameType(gameType);

        return gameSettings;
    }
}