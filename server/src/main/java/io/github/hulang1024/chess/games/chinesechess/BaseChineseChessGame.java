package io.github.hulang1024.chess.games.chinesechess;

import io.github.hulang1024.chess.games.Game;
import io.github.hulang1024.chess.games.GameSettings;
import io.github.hulang1024.chess.games.GameStatesResponse;
import io.github.hulang1024.chess.games.chess.ChessHost;
import io.github.hulang1024.chess.games.chinesechess.rule.Chess;
import io.github.hulang1024.chess.games.chinesechess.rule.ChessboardState;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

public class BaseChineseChessGame extends Game {
    @Getter
    private Stack<ChessAction> actionStack = new Stack<>();

    @Getter
    protected ChessboardState chessboardState = new ChessboardState();

    public BaseChineseChessGame(GameSettings gameSettings) {
        super(gameSettings);
    }

    public void moveChess(ChessAction action) {
        action.getChess().type = chessboardState.chessAt(action.getFromPos(), action.getChess().chessHost).type;
        action.setEatenChess(chessboardState.chessAt(action.getToPos(), action.getChess().chessHost));

        actionStack.push(action);

        chessboardState.moveChess(action.getFromPos(), action.getToPos(), action.getChess().chessHost);

        turnActiveChessHost();
    }

    @Override
    public void withdraw() {
        if (actionStack.isEmpty()) {
            return;
        }
        ChessAction lastAction = actionStack.pop();
        chessboardState.moveChess(lastAction.getToPos(), lastAction.getFromPos(), lastAction.getChess().chessHost);
        chessboardState.chessAt(
            lastAction.getFromPos(), lastAction.getChess().chessHost).isFront = lastAction.getChess().isFront;
        if (lastAction.getEatenChess() != null) {
            chessboardState.setChess(
                lastAction.getToPos(), lastAction.getEatenChess(), lastAction.getChess().chessHost);
        }
        turnActiveChessHost();
    }

    @Override
    public GameStatesResponse createGameStatesResponse() {
        return new ChineseChessGameStatesResponse();
    }

    @Override
    public ChineseChessGameStatesResponse buildGameStatesResponse() {
        ChineseChessGameStatesResponse response = (ChineseChessGameStatesResponse) super.buildGameStatesResponse();
        response.setActionStack(getActionStack());
        response.setChesses(toStateChesses());
        return response;
    }

    protected List<ChineseChessGameStatesResponse.Chess> toStateChesses() {
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
                    sChess.setIsFront(chess.isFront ? 1 : 0);
                    chesses.add(sChess);
                }
            }
        }
        return chesses;
    }

}