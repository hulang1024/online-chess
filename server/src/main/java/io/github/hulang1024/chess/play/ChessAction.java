package io.github.hulang1024.chess.play;

import io.github.hulang1024.chess.play.rule.Chess;
import io.github.hulang1024.chess.play.rule.ChessEnum;
import io.github.hulang1024.chess.play.rule.ChessHost;
import io.github.hulang1024.chess.play.rule.ChessPos;
import lombok.Data;

@Data
public class ChessAction {
    private ChessHost chessHost;
    private ChessEnum chessType;
    private ChessPos fromPos;
    private ChessPos toPos;
    private Chess eatenChess;
}