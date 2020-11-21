package io.github.hulang1024.chinesechess.spectator;

import io.github.hulang1024.chinesechess.play.GamePlayStatesResponse;
import io.github.hulang1024.chinesechess.room.Room;
import lombok.Data;

@Data
public class SpectateResponseData {
    private int code;
    private Room room;
    private GamePlayStatesResponse states;
}
