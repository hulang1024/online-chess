package io.github.hulang1024.chess.games;

import lombok.Getter;
import lombok.Setter;

/**
 * 棋局
 * @author HuLang
 */
public abstract class Game {
    @Getter
    protected GameContext context;

    @Getter
    @Setter
    protected GameState state;

    @Getter
    protected int activeChessHost;

    public Game(GameContext context) {
        this.context = context;

        context.getGameUsers().forEach(gameUser -> {
            gameUser.setTimer(new GameTimer(getGameSettings().getTimer()));
        });
    }

    public GameSettings getGameSettings() {
        return context.getGameSettings();
    }

    public void start() {
        activeChessHost = 1;
        state = GameState.PLAYING;
        getTimer(0).start();
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
        context.getGameUsers().forEach(gameUser -> {
            gameUser.getTimer().stop();
        });
    }

    public void turnActiveChessHost() {
        getTimer(activeChessHost - 1).stop();
        activeChessHost = 1 + activeChessHost++ % context.getGameUsers().size();
        getTimer(activeChessHost - 1).start();
    }

    public GameTimer getActiveTimer() {
        return getTimer(activeChessHost - 1);
    }

    public GameInitialStates createGameInitialStatesResponse() {
        return null;
    }

    protected abstract GameStatesResponse createGameStatesResponse();

    public GameStatesResponse buildGameStatesResponse() {
        GameStatesResponse gameStates = createGameStatesResponse();
        gameStates.setActiveChessHost(activeChessHost);

        if (state == GameState.PLAYING) {
            getActiveTimer().useTime();
        }

        return gameStates;
    }

    private GameTimer getTimer(int index) {
        return context.getGameUsers().get(index).getTimer();
    }

    public abstract void withdraw();
}