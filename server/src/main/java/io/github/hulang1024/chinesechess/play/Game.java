package io.github.hulang1024.chinesechess.play;

import io.github.hulang1024.chinesechess.play.rule.Chess;
import io.github.hulang1024.chinesechess.play.rule.ChessHost;
import io.github.hulang1024.chinesechess.play.rule.ChessboardState;
import io.github.hulang1024.chinesechess.room.Room;
import lombok.Getter;
import lombok.Setter;

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
    @Setter
    private GameState state;

    @Getter
    private ChessHost activeChessHost;

    @Getter
    private GameTimer redTimer;

    @Getter
    private GameTimer blackTimer;

    @Getter
    private Stack<ChessAction> actionStack = new Stack<>();

    @Getter
    private ChessboardState chessboardState = new ChessboardState();

    public Game(Room room) {
        this.room = room;
        this.activeChessHost = ChessHost.RED;
        state = GameState.PLAYING;
        redTimer = new GameTimer(room.getRoomSettings());
        blackTimer = new GameTimer(room.getRoomSettings());
        redTimer.start();
    }

    public void turnActiveChessHost() {
        activeChessHost = activeChessHost.reverse();
        if (activeChessHost == ChessHost.RED) {
            redTimer.start();
            blackTimer.stop();
        } else {
            blackTimer.start();
            redTimer.stop();
        }
    }

    public void pause() {
        state = GameState.PAUSE;
        blackTimer.stop();
        redTimer.stop();
    }

    public GamePlayStatesResponse buildGameStatesResponse() {
        GamePlayStatesResponse gameStates = new GamePlayStatesResponse();
        if (getActiveChessHost() != null) {
            gameStates.setActiveChessHost(getActiveChessHost().code());
        }
        gameStates.setChesses(toStateChesses());
        gameStates.setActionStack(getActionStack());
        gameStates.setRoom(room);

        if (state == GameState.PLAYING) {
            GameTimer gameTimer = (activeChessHost == ChessHost.RED ? redTimer : blackTimer);
            gameTimer.useTime();
        }
        gameStates.setRedTimer(redTimer);
        gameStates.setBlackTimer(blackTimer);
        return gameStates;
    }

    public List<GamePlayStatesResponse.Chess> toStateChesses() {
        List<GamePlayStatesResponse.Chess> chesses = new ArrayList<>();
        for (int r = 0; r < 10; r++) {
            for (int c = 0; c < 9; c++) {
                Chess chess = chessboardState.chessAt(r, c);
                if (chess != null) {
                    GamePlayStatesResponse.Chess sChess = new GamePlayStatesResponse.Chess();
                    sChess.setChessHost(chess.chessHost == ChessHost.RED ? 1 : 2);
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
