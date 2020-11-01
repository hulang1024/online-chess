package io.github.hulang1024.chinesechessserver.domain;

import lombok.Getter;

/**
 * 棋局
 * @author HuLang
 */
public class ChessPlayRound {
    @Getter
    private Player redPlayer;
    @Getter
    private Player blackPlayer;

    public ChessPlayRound(Player redPlayer, Player blackPlayer) {
        this.redPlayer = redPlayer;
        this.blackPlayer = blackPlayer;
    }

    public void swapRedAndBlack() {
        Player player = redPlayer;
        redPlayer = blackPlayer;
        blackPlayer = player;
    }
}
