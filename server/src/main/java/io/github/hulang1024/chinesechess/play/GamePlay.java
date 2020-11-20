package io.github.hulang1024.chinesechess.play;

import io.github.hulang1024.chinesechess.play.rule.ChessHost;
import io.github.hulang1024.chinesechess.play.rule.ChessboardState;
import io.github.hulang1024.chinesechess.user.User;
import lombok.Getter;

import java.util.Stack;

/**
 * 棋局
 * @author HuLang
 */
public class GamePlay {
    @Getter
    private User redChessUser;
    @Getter
    private User blackChessUser;

    @Getter
    private ChessHost activeChessHost;

    @Getter
    private Stack<ChessAction> actionStack = new Stack<>();

    @Getter
    private ChessboardState chessboardState = new ChessboardState();

    public GamePlay(User redChessUser, User blackChessUser) {
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
