package io.github.hulang1024.chinesechessserver.domain.chinesechess.rule;

public class Chess {
    public ChessHost chessHost;
    public ChessEnum type;

    public Chess(ChessHost chessHost, ChessEnum type) {
        this.chessHost = chessHost;
        this.type = type;
    }
}
