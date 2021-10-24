package io.github.hulang1024.chess.games.reversi;

import io.github.hulang1024.chess.games.Game;
import io.github.hulang1024.chess.games.GameContext;
import io.github.hulang1024.chess.games.GameStatesResponse;
import io.github.hulang1024.chess.games.reversi.rule.ChessboardState;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

public class ReversiGame extends Game {
    @Getter
    private Stack<ChessAction> actionStack = new Stack<>();

    @Getter
    private ChessboardState chessboardState = new ChessboardState();

    public ReversiGame(GameContext context) {
        super(context);
    }

    public void putChess(ChessAction action) {
        actionStack.push(action);

        chessboardState.reverse(action.getPos(), action.getChess());

        turnActiveChessHost();
    }

    @Override
    public void withdraw() {
        if (actionStack.isEmpty()) {
            return;
        }
    }

    @Override
    protected GameStatesResponse createGameStatesResponse() {
        return new ReversiGameplayStatesResponse();
    }

    @Override
    public ReversiGameplayStatesResponse buildGameStatesResponse() {
        ReversiGameplayStatesResponse gameStates = (ReversiGameplayStatesResponse) super.buildGameStatesResponse();
        gameStates.setActionStack(getActionStack());
        gameStates.setChesses(toStateChesses());
        return gameStates;
    }

    private List<ReversiGameplayStatesResponse.Chess> toStateChesses() {
        List<ReversiGameplayStatesResponse.Chess> chesses = new ArrayList<>();
        for (int r = 0; r < chessboardState.getSize(); r++) {
            for (int c = 0; c < chessboardState.getSize(); c++) {
                int chess = chessboardState.chessAt(r, c);
                if (chess != 0) {
                    ReversiGameplayStatesResponse.Chess sChess = new ReversiGameplayStatesResponse.Chess();
                    sChess.setType(chess);
                    sChess.setRow(r);
                    sChess.setCol(c);
                    chesses.add(sChess);
                }
            }
        }
        return chesses;
    }

}