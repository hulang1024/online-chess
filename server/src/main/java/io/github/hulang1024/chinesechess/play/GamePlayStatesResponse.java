package io.github.hulang1024.chinesechess.play;

import java.util.List;
import java.util.Stack;

import io.github.hulang1024.chinesechess.room.Room;
import lombok.Data;

@Data
public class GamePlayStatesResponse {
    private List<Chess> chesses;
    private Room room;
    private Integer activeChessHost;
    private Stack<ChessAction> actionStack;
    
    @Data
    public static class Chess {
        private int row;
        private int col;
        private int host;
        private char type;
    }
}
