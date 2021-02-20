package io.github.hulang1024.chess.games.chinesechess;

import io.github.hulang1024.chess.games.Game;
import io.github.hulang1024.chess.games.GameState;
import io.github.hulang1024.chess.games.chess.ChessHost;
import io.github.hulang1024.chess.games.chinesechess.rule.Chess;
import io.github.hulang1024.chess.games.chinesechess.rule.ChessboardState;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

public class ChineseChessGame extends Game {
    @Getter
    private Stack<ChessAction> actionStack = new Stack<>();

    @Getter
    private ChessboardState chessboardState = new ChessboardState();

    public ChineseChessGame(ChineseChessGameSettings gameSettings) {
        super(gameSettings);
    }

    public void moveChess(ChessAction action) {
        action.setChessType(chessboardState.chessAt(action.getFromPos(), action.getChessHost()).type);
        action.setEatenChess(chessboardState.chessAt(action.getToPos(), action.getChessHost()));

        actionStack.push(action);

        chessboardState.moveChess(action.getFromPos(), action.getToPos(), action.getChessHost());

        turnActiveChessHost();
    }

    @Override
    public void withdraw() {
        if (actionStack.isEmpty()) {
            return;
        }
        ChessAction lastAction = actionStack.pop();
        chessboardState.moveChess(lastAction.getToPos(), lastAction.getFromPos(), lastAction.getChessHost());
        if (lastAction.getEatenChess() != null) {
            chessboardState.setChess(lastAction.getToPos(), lastAction.getEatenChess(), lastAction.getChessHost());
        }
        turnActiveChessHost();
    }

    @Override
    public ChineseChessGameStatesResponse buildGameStatesResponse() {
        ChineseChessGameStatesResponse gameStates = new ChineseChessGameStatesResponse();
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

    private List<ChineseChessGameStatesResponse.Chess> toStateChesses() {
        List<ChineseChessGameStatesResponse.Chess> chesses = new ArrayList<>();
        for (int r = 0; r < 10; r++) {
            for (int c = 0; c < 9; c++) {
                Chess chess = chessboardState.chessAt(r, c);
                if (chess != null) {
                    ChineseChessGameStatesResponse.Chess sChess = new ChineseChessGameStatesResponse.Chess();
                    sChess.setChessHost(chess.chessHost == ChessHost.FIRST ? 1 : 2);
                    sChess.setType(chess.type.name().charAt(0));
                    sChess.setRow(r);
                    sChess.setCol(c);
                    chesses.add(sChess);
                }
            }
        }
        return chesses;
    }

}