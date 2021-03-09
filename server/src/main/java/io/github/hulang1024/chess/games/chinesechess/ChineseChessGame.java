package io.github.hulang1024.chess.games.chinesechess;

public class ChineseChessGame extends BaseChineseChessGame {
    public ChineseChessGame(ChineseChessGameSettings gameSettings) {
        super(gameSettings);
        chessboardState.initializeLayout();
    }
}