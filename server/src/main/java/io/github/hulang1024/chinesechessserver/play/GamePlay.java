package io.github.hulang1024.chinesechessserver.domain;

import java.util.Stack;

import io.github.hulang1024.chinesechessserver.domain.chinesechess.ChessAction;
import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessHost;
import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessboardState;
import lombok.Getter;

/**
 * 棋局
 * @author HuLang
 */
public class GamePlay {
    @Getter
    private SessionUser redChessUser;
    @Getter
    private SessionUser blackChessUser;

    @Getter
    private ChessHost activeChessHost;

    @Getter
    private Stack<ChessAction> actionStack = new Stack<>();

    @Getter
    private ChessboardState chessboardState = new ChessboardState();

    public GamePlay(SessionUser redChessUser, SessionUser blackChessUser) {
        this.redChessUser = redChessUser;
        this.redChessUser.setChessHost(ChessHost.RED);
        this.blackChessUser = blackChessUser;
        this.blackChessUser.setChessHost(ChessHost.BLACK);
        this.activeChessHost = ChessHost.RED;
    }

    public void turnActiveChessHost() {
        this.activeChessHost = this.activeChessHost.reverse();
    }
}
