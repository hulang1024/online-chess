package io.github.hulang1024.chess.games.chinesechess;

import io.github.hulang1024.chess.games.GameContext;

public class ChineseChessGame extends BaseChineseChessGame {
    public ChineseChessGame(GameContext context) {
        super(context);
        chessboardState.initializeLayout();
    }
}