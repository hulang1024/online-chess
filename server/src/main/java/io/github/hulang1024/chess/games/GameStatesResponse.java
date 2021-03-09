package io.github.hulang1024.chess.games;

import io.github.hulang1024.chess.room.Room;
import lombok.Data;

@Data
public class GameStatesResponse {
    private Room room;
    private Integer activeChessHost;
    private GameTimer firstTimer;
    private GameTimer secondTimer;
}