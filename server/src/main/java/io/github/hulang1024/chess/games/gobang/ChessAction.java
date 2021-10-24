package io.github.hulang1024.chess.games.gobang;

import io.github.hulang1024.chess.games.chess.ChessPos;
import lombok.Data;

@Data
public class ChessAction {
    private int chess;
    private ChessPos pos;
}