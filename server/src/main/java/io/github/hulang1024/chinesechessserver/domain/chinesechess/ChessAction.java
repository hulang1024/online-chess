package io.github.hulang1024.chinesechessserver.domain.chinesechess;

import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessEnum;
import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessHost;
import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessPos;

public class ChessAction {
    public ChessHost chessHost;
    public ChessEnum chess;
    public ChessPos fromPos;
    public ChessPos toPos;
}
