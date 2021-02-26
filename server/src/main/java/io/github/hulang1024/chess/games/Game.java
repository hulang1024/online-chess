package io.github.hulang1024.chess.games;

import io.github.hulang1024.chess.games.chess.ChessHost;
import lombok.Getter;
import lombok.Setter;

/**
 * 棋局
 * @author HuLang
 */
public abstract class Game {
    @Getter
    protected GameSettings gameSettings;

    @Getter
    @Setter
    protected GameState state;

    @Getter
    protected ChessHost activeChessHost;

    @Getter
    @Setter
    protected GameTimer firstTimer;

    @Getter
    @Setter
    protected GameTimer secondTimer;

    public Game(GameSettings gameSettings) {
        this.gameSettings = gameSettings;
    }

    public void start() {
        this.activeChessHost = ChessHost.FIRST;
        state = GameState.PLAYING;
        firstTimer.start();
    }

    public void pause() {
        state = GameState.PAUSE;
        getActiveTimer().pause();
    }

    public void resume() {
        state = GameState.PLAYING;
        getActiveTimer().resume();
    }

    public void over() {
        state = GameState.END;
        firstTimer.stop();
        secondTimer.stop();
    }

    public void turnActiveChessHost() {
        activeChessHost = activeChessHost.reverse();
        if (activeChessHost == ChessHost.FIRST) {
            firstTimer.start();
            secondTimer.stop();
        } else {
            secondTimer.start();
            firstTimer.stop();
        }
    }

    public GameTimer getActiveTimer() {
        return activeChessHost == ChessHost.FIRST ? firstTimer : secondTimer;
    }

    protected abstract GameStatesResponse createGameStatesResponse();

    public GameStatesResponse buildGameStatesResponse() {
        GameStatesResponse gameStates = createGameStatesResponse();
        if (getActiveChessHost() != null) {
            gameStates.setActiveChessHost(getActiveChessHost().code());
        }
        gameStates.setFirstTimer(firstTimer);
        gameStates.setSecondTimer(secondTimer);

        if (state == GameState.PLAYING) {
            getActiveTimer().useTime();
        }

        return gameStates;
    }

    public abstract void withdraw();
}