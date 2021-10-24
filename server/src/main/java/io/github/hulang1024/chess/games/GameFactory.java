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
    public static GameRuleset createGameRuleset(GameType gameType) {
        switch (gameType) {
            case chinesechess:
            case chinesechessDark:
            case gobang:
            case reversi:
                return new P2GameRuleset();
            default:
                return null;
        }
    }

    public static Game createGame(GameContext context) {
        switch (context.getGameSettings().getGameType()) {
            case chinesechess:
                return new ChineseChessGame(context);
            case chinesechessDark:
                return new ChineseChessDarkGame(context);
            case gobang:
                return new GobangGame(context);
            case reversi:
                return new ReversiGame(context);
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
                break;
            default:
                return null;
        }
        gameSettings.setGameType(gameType);

        return gameSettings;
    }
}