package io.github.hulang1024.chinesechessserver.play;

import io.github.hulang1024.chinesechessserver.play.rule.Chess;
import io.github.hulang1024.chinesechessserver.play.rule.ChessEnum;
import io.github.hulang1024.chinesechessserver.play.rule.ChessHost;
import io.github.hulang1024.chinesechessserver.play.rule.ChessPos;
import lombok.Data;

@Data
public class ChessAction {
    private ChessHost chessHost;
    private ChessEnum chessType;
    private ChessPos fromPos;
    private ChessPos toPos;
    private Chess eatenChess;
}
