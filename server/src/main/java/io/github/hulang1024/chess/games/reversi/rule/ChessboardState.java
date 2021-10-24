package io.github.hulang1024.chess.games.reversi.rule;

import io.github.hulang1024.chess.games.chess.ChessPos;
import io.github.hulang1024.chess.games.chess.P2Play;

public class ChessboardState {
    private int[][] array = new int[8][8];

    public int getSize() {
        return 8;
    }

    public int chessAt(ChessPos pos) {
        return chessAt(pos.row, pos.col);
    }

    public int chessAt(int row, int col) {
        return array[row][col];
    }

    public void setChess(ChessPos pos, int chess) {
        array[pos.row][pos.col] = chess;
    }

    /**
     * 翻转棋子，前置条件：有可翻转
     * @param origin 起点位置
     * @param chess 反转参照棋子
     */
    public void reverse(ChessPos origin, int chess) {
        // dx, dy：上,下,左,右,左上,右下,右上,左下
        int[] dirTable = new int[]{ 0, -1, 0, 1, -1, 0, 1, 0, -1, -1, 1, 1, 1, -1, -1, 1 };

        for (int i = 0; i < dirTable.length; i += 2) {
            int curRow = origin.row;
            int curCol = origin.col;
            while (true) {
                curRow += dirTable[i + 1];
                curCol += dirTable[i];
                if (true
                    && (curRow >= 0 && curRow < getSize())
                    && (curCol >= 0 && curCol < getSize())
                    && (chessAt(curRow, curCol) == P2Play.reverse(chess))) {
                    setChess(new ChessPos(curRow, curCol), P2Play.reverse(chess));
                } else {
                    break;
                }
            }
        }
    }
}