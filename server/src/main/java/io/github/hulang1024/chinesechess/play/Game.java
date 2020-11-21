package io.github.hulang1024.chinesechess.play;

import io.github.hulang1024.chinesechess.play.rule.ChessHost;
import io.github.hulang1024.chinesechess.play.rule.ChessboardState;
import lombok.Getter;

import java.util.Stack;

/**
 * 棋局
 * @author HuLang
 */
public class Game {
    @Getter
    private ChessHost activeChessHost;

    @Getter
    private Stack<ChessAction> actionStack = new Stack<>();

    @Getter
    private ChessboardState chessboardState = new ChessboardState();

    public Game() {
        this.activeChessHost = ChessHost.RED;
    }

    public void turnActiveChessHost() {
        this.activeChessHost = this.activeChessHost.reverse();
    }
}
