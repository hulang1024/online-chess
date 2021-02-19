package io.github.hulang1024.chess.games.gobang;

import io.github.hulang1024.chess.games.chess.ChessHost;
import io.github.hulang1024.chess.games.gobang.rule.ChessboardState;
import io.github.hulang1024.chess.games.Game;
import io.github.hulang1024.chess.games.GameState;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

public class GobangGame extends Game {
    @Getter
    private Stack<ChessAction> actionStack = new Stack<>();

    @Getter
    private ChessboardState chessboardState = new ChessboardState();

    public void putChess(ChessAction action) {
        actionStack.push(action);

        chessboardState.setChess(action.getPos(), action.getChess());

        turnActiveChessHost();
    }

    @Override
    public void withdraw() {
        if (actionStack.isEmpty()) {
            return;
        }
        ChessAction lastAction = actionStack.pop();
        chessboardState.setChess(lastAction.getPos(), null);

        turnActiveChessHost();
    }

    @Override
    public GobangGameplayStatesResponse buildGameStatesResponse() {
        GobangGameplayStatesResponse gameStates = new GobangGameplayStatesResponse();
        if (getActiveChessHost() != null) {
            gameStates.setActiveChessHost(getActiveChessHost().code());
        }
        gameStates.setFirstTimer(firstTimer);
        gameStates.setSecondTimer(secondTimer);

        gameStates.setChesses(toStateChesses());
        gameStates.setActionStack(getActionStack());

        if (state == GameState.PLAYING) {
            getActiveTimer().useTime();
        }

        return gameStates;
    }

    private List<GobangGameplayStatesResponse.Chess> toStateChesses() {
        List<GobangGameplayStatesResponse.Chess> chesses = new ArrayList<>();
        for (int r = 0; r < 10; r++) {
            for (int c = 0; c < 9; c++) {
                ChessHost chess = chessboardState.chessAt(r, c);
                if (chess != null) {
                    GobangGameplayStatesResponse.Chess sChess = new GobangGameplayStatesResponse.Chess();
                    sChess.setType(chess.code());
                    sChess.setRow(r);
                    sChess.setCol(c);
                    chesses.add(sChess);
                }
            }
        }
        return chesses;
    }

}