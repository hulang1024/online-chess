package io.github.hulang1024.chinesechess.scene.chessplay.rule;

import io.github.hulang1024.chinesechess.scene.chessplay.Chessboard;

/**
 * 游戏局
 * @author Hu Lang
 */
public class RoundGame {
    public Chessboard chessboard;

    /**
     * 查看指定方是否布局在棋盘顶部
     * @return
     */
    public boolean isHostAtChessboardTop(HostEnum host) {
        //TODO: 暂定红方在顶部（最顶部纵坐标是0），后面支持变化
        return host == HostEnum.RED;
    }

}
