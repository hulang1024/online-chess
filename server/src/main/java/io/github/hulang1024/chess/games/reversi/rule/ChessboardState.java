package io.github.hulang1024.chess.games.reversi.rule;

import io.github.hulang1024.chess.games.chess.ChessHost;
import io.github.hulang1024.chess.games.chess.ChessPos;

public class ChessboardState {
    private ChessHost[][] array = new ChessHost[8][8];

    public int getSize() {
        return 8;
    }

    public ChessHost chessAt(ChessPos pos) {
        return chessAt(pos.row, pos.col);
    }

    public ChessHost chessAt(int row, int col) {
        return array[row][col];
    }

    public void setChess(ChessPos pos, ChessHost chess) {
        array[pos.row][pos.col] = chess;
    }

    /**
     * 翻转棋子，前置条件：有可翻转
     * @param origin 起点位置
     * @param chess 反转参照棋子
     */
    public void reverse(ChessPos origin, ChessHost chess) {
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
                    && (chessAt(curRow, curCol) == chess.reverse())) {
                    setChess(new ChessPos(curRow, curCol), chess.reverse());
                } else {
                    break;
                }
            }
        }
    }
}