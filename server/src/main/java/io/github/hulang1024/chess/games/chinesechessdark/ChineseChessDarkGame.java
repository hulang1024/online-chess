package io.github.hulang1024.chess.games.chinesechessdark;

import io.github.hulang1024.chess.games.GameInitialStates;
import io.github.hulang1024.chess.games.chinesechess.BaseChineseChessGame;
import io.github.hulang1024.chess.games.chinesechess.ChessAction;
import io.github.hulang1024.chess.games.chinesechess.ChineseChessGameSettings;

public class ChineseChessDarkGame extends BaseChineseChessGame {

    public ChineseChessDarkGame(ChineseChessGameSettings gameSettings) {
        super(gameSettings);
        gameSettings.setCanWithdraw(false);

        ChessboardStateRandomGenerator.generate(chessboardState);
    }

    @Override
    public void moveChess(ChessAction action) {
        super.moveChess(action);
        chessboardState.chessAt(action.getToPos(), action.getChess().chessHost).isFront = true;
    }

    @Override
    public GameInitialStates createGameInitialStatesResponse() {
        ChineseChessDarkGameInitialStates initialStates = new ChineseChessDarkGameInitialStates();
        initialStates.setChesses(toStateChesses());
        return initialStates;
    }
}