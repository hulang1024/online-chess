package io.github.hulang1024.chess.games.chinesechess.rule;

public class Chess {
    public int chessHost;
    public ChessEnum type;
    public boolean isFront = true;

    public Chess(int chessHost, ChessEnum type) {
        this.chessHost = chessHost;
        this.type = type;
    }
}