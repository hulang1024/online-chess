package io.github.hulang1024.chess.games.chinesechess;

import io.github.hulang1024.chess.games.chess.ChessPos;
import io.github.hulang1024.chess.games.chinesechess.rule.Chess;
import lombok.Data;

@Data
public class ChessAction {
    private Chess chess;
    private ChessPos fromPos;
    private ChessPos toPos;
    private Chess eatenChess;
}