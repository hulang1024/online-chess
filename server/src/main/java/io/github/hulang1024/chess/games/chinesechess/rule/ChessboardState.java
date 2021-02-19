package io.github.hulang1024.chess.games.chinesechess.rule;

import io.github.hulang1024.chess.games.chess.ChessHost;
import io.github.hulang1024.chess.games.chess.ChessPos;

public class ChessboardState {
    private Chess[][] array = new Chess[10][9];

    public ChessboardState() {
        array[0][0] = new Chess(ChessHost.SECOND, ChessEnum.R);
        array[0][1] = new Chess(ChessHost.SECOND, ChessEnum.N);
        array[0][2] = new Chess(ChessHost.SECOND, ChessEnum.M);
        array[0][3] = new Chess(ChessHost.SECOND, ChessEnum.G);
        array[0][4] = new Chess(ChessHost.SECOND, ChessEnum.K);
        array[0][5] = new Chess(ChessHost.SECOND, ChessEnum.G);
        array[0][6] = new Chess(ChessHost.SECOND, ChessEnum.M);
        array[0][7] = new Chess(ChessHost.SECOND, ChessEnum.N);
        array[0][8] = new Chess(ChessHost.SECOND, ChessEnum.R);
        array[2][1] = new Chess(ChessHost.SECOND, ChessEnum.C);
        array[2][7] = new Chess(ChessHost.SECOND, ChessEnum.C);
        for (int c = 0; c < 9; c += 2) {
            array[3][c] = new Chess(ChessHost.SECOND, ChessEnum.S);
        }

        array[9][0] = new Chess(ChessHost.FIRST, ChessEnum.R);
        array[9][1] = new Chess(ChessHost.FIRST, ChessEnum.N);
        array[9][2] = new Chess(ChessHost.FIRST, ChessEnum.M);
        array[9][3] = new Chess(ChessHost.FIRST, ChessEnum.G);
        array[9][4] = new Chess(ChessHost.FIRST, ChessEnum.K);
        array[9][5] = new Chess(ChessHost.FIRST, ChessEnum.G);
        array[9][6] = new Chess(ChessHost.FIRST, ChessEnum.M);
        array[9][7] = new Chess(ChessHost.FIRST, ChessEnum.N);
        array[9][8] = new Chess(ChessHost.FIRST, ChessEnum.R);
        array[7][1] = new Chess(ChessHost.FIRST, ChessEnum.C);
        array[7][7] = new Chess(ChessHost.FIRST, ChessEnum.C);
        for (int c = 0; c < 9; c += 2) {
            array[6][c] = new Chess(ChessHost.FIRST, ChessEnum.S);
        }
    }

    public Chess chessAt(int row, int col) {
        return array[row][col];
    }

    public Chess chessAt(ChessPos pos, ChessHost host) {
        pos = convertViewPos(pos, host);
        return chessAt(pos.row, pos.col);
    }

    public void setChess(ChessPos pos, Chess chess, ChessHost host) {
        pos = convertViewPos(pos, host);
        setChess(pos, chess);
    }

    public void setChess(ChessPos pos, Chess chess) {
        array[pos.row][pos.col] = chess;
    }

    public void moveChess(ChessPos fromPos, ChessPos toPos, ChessHost host) {
        fromPos = convertViewPos(fromPos, host);
        toPos = convertViewPos(toPos, host);
        moveChess(fromPos, toPos);
    }

    public void moveChess(ChessPos fromPos, ChessPos toPos) {
        Chess chess = array[fromPos.row][fromPos.col];
        array[toPos.row][toPos.col] = chess;
        array[fromPos.row][fromPos.col] = null;
    }
    /**
     * 将源视角棋方的棋子位置转换为当前设置的视角棋方((this.viewChessHost)的棋子位置
     * @param pos 源视角棋方的棋子位置
     * @param host 源视角棋方
     */
    public static ChessPos convertViewPos(ChessPos pos, ChessHost host) {
        return ChessHost.FIRST == host
            ? pos
            : new ChessPos(9 - pos.row, 8 - pos.col);
    }

}