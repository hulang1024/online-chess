package io.github.hulang1024.chess.games.chinesechess.rule;

import io.github.hulang1024.chess.games.chess.ChessHost;

public class Chess {
    public ChessHost chessHost;
    public ChessEnum type;
    public boolean isFront = true;

    public Chess(ChessHost chessHost, ChessEnum type) {
        this.chessHost = chessHost;
        this.type = type;
    }
}