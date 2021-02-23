package io.github.hulang1024.chess.games.reversi;

import io.github.hulang1024.chess.games.chess.ChessHost;
import io.github.hulang1024.chess.games.chess.ChessPos;
import lombok.Data;

@Data
public class ChessAction {
    private ChessHost chess;
    private ChessPos pos;
}