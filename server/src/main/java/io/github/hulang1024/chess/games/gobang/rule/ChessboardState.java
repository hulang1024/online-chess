package io.github.hulang1024.chess.games.gobang.rule;

import io.github.hulang1024.chess.games.chess.ChessPos;

public class ChessboardState {
    private int size;
    private int[][] array;

    public ChessboardState(int size) {
        this.size = size;
        this.array = new int[size][size];
    }

    public int getSize() {
        return size;
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
}