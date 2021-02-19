package io.github.hulang1024.chess.games.gobang.rule;

import io.github.hulang1024.chess.games.chess.ChessHost;
import io.github.hulang1024.chess.games.chess.ChessPos;

public class ChessboardState {
    private ChessHost[][] array = new ChessHost[15][15];

    public ChessHost chessAt(ChessPos pos) {
        return chessAt(pos.row, pos.col);
    }

    public ChessHost chessAt(int row, int col) {
        return array[row][col];
    }

    public void setChess(ChessPos pos, ChessHost chess) {
        array[pos.row][pos.col] = chess;
    }
}