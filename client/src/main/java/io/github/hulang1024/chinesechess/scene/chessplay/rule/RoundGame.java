package io.github.hulang1024.chinesechess.scene.chessplay.rule;

import io.github.hulang1024.chinesechess.scene.chessplay.DrawableChessboard;

/**
 * 游戏局
 * @author Hu Lang
 */
public interface RoundGame {
    /**
     * 棋盘
     * @return
     */
    DrawableChessboard getChessboard();

    /**
     * 查看指定方是否布局在棋盘顶部
     * @param host
     * @return
     */
    boolean isHostAtChessboardTop(HostEnum host);
}
