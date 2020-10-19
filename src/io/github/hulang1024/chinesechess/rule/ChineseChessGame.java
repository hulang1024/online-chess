package io.github.hulang1024.chinesechess.rule;

import java.util.Scanner;

/**
 * @author Hu Lang
 */
public class ChineseChessGame {
    private Chessboard chessboard = new Chessboard();
    private Player player1;
    private Player player2;

    public void startRound() {
        resetChessLayout();

    }

    private void resetChessLayout() {

    }

    /**
     * 查看指定方是否布局在棋盘顶部
     * @return
     */
    public boolean isHostAtChessboardTop(HostEnum host) {
        //TODO: 暂定红方在顶部（最顶部纵坐标是0），后面支持变化
        return host == HostEnum.RED;
    }

}
