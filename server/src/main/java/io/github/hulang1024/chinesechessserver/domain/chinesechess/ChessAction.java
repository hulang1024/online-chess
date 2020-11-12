package io.github.hulang1024.chinesechessserver.domain.chinesechess;

import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.Chess;
import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessEnum;
import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessHost;
import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessPos;
import lombok.Data;

@Data
public class ChessAction {
    private ChessHost chessHost;
    private ChessEnum chessType;
    private ChessPos fromPos;
    private ChessPos toPos;
    private Chess eatenChess;
}
