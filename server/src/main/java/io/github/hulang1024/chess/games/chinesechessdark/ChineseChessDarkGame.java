package io.github.hulang1024.chess.games.chinesechessdark;

import io.github.hulang1024.chess.games.GameContext;
import io.github.hulang1024.chess.games.GameInitialStates;
import io.github.hulang1024.chess.games.chinesechess.BaseChineseChessGame;
import io.github.hulang1024.chess.games.chinesechess.ChessAction;

public class ChineseChessDarkGame extends BaseChineseChessGame {

    public ChineseChessDarkGame(GameContext context) {
        super(context);
        ChineseChessDarkGameSettings gameSettings = (ChineseChessDarkGameSettings)context.getGameSettings();
        gameSettings.setCanWithdraw(false);

        if (gameSettings.isFullRandom()) {
            ChessboardStateRandomGenerator.generateFull(chessboardState);
        } else {
            ChessboardStateRandomGenerator.generate(chessboardState);
        }
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