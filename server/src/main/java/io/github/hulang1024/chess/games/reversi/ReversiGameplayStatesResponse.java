package io.github.hulang1024.chess.games.reversi;

import io.github.hulang1024.chess.games.GameStatesResponse;
import lombok.Data;

import java.util.List;
import java.util.Stack;

@Data
public class ReversiGameplayStatesResponse extends GameStatesResponse {
    private List<Chess> chesses;
    private Stack<ChessAction> actionStack;

    @Data
    public static class Chess {
        private int row;
        private int col;
        private int type;
    }
}