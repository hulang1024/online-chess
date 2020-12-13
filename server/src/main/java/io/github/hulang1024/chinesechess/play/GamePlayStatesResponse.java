package io.github.hulang1024.chinesechess.play;

import io.github.hulang1024.chinesechess.room.Room;
import lombok.Data;

import java.util.List;
import java.util.Stack;

@Data
public class GamePlayStatesResponse {
    private Room room;
    private List<Chess> chesses;
    private Integer activeChessHost;
    private Stack<ChessAction> actionStack;
    private GameTimer redTimer;
    private GameTimer blackTimer;
    
    @Data
    public static class Chess {
        private int row;
        private int col;
        private int chessHost;
        private char type;
    }
}
