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
public class RoundGame {
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

    public RoundGame(SessionUser redChessUser, SessionUser blackChessUser) {
        this.redChessUser = redChessUser;
        this.blackChessUser = blackChessUser;
        this.activeChessHost = ChessHost.RED;
    }

    public void turnActiveChessHost() {
        this.activeChessHost = this.activeChessHost.reverse();
    }

    /**
     * 交换棋方
     */
    public void swapRedAndBlack() {
        SessionUser user = redChessUser;
        redChessUser = blackChessUser;
        blackChessUser = user;
        redChessUser.setChessHost(ChessHost.RED);
        blackChessUser.setChessHost(ChessHost.BLACK);
    }
}
