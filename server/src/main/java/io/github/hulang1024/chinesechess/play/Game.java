package io.github.hulang1024.chinesechess.play;

import io.github.hulang1024.chinesechess.play.rule.Chess;
import io.github.hulang1024.chinesechess.play.rule.ChessHost;
import io.github.hulang1024.chinesechess.play.rule.ChessboardState;
import io.github.hulang1024.chinesechess.room.Room;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

/**
 * 棋局
 * @author HuLang
 */
public class Game {
    @Getter
    Room room;

    @Getter
    private ChessHost activeChessHost;

    @Getter
    private Stack<ChessAction> actionStack = new Stack<>();

    @Getter
    private ChessboardState chessboardState = new ChessboardState();

    public Game(Room room) {
        this.room = room;
        this.activeChessHost = ChessHost.RED;
    }

    public void turnActiveChessHost() {
        this.activeChessHost = this.activeChessHost.reverse();
    }

    public GamePlayStatesResponse buildGamePlayStatesResponse() {
        GamePlayStatesResponse gamePlayStates = new GamePlayStatesResponse();
        if (getActiveChessHost() != null) {
            gamePlayStates.setActiveChessHost(getActiveChessHost().code());
        }
        gamePlayStates.setChesses(toStateChesses());
        gamePlayStates.setActionStack(getActionStack());
        gamePlayStates.setRoom(room);
        return gamePlayStates;
    }

    public List<GamePlayStatesResponse.Chess> toStateChesses() {
        List<GamePlayStatesResponse.Chess> chesses = new ArrayList<>();
        for (int r = 0; r < 10; r++) {
            for (int c = 0; c < 9; c++) {
                Chess chess = chessboardState.chessAt(r, c);
                if (chess != null) {
                    GamePlayStatesResponse.Chess sChess = new GamePlayStatesResponse.Chess();
                    sChess.setHost(chess.chessHost == ChessHost.RED ? 1 : 2);
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
