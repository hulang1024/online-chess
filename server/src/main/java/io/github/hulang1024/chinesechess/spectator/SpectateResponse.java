package io.github.hulang1024.chinesechess.spectator;

import io.github.hulang1024.chinesechess.play.GamePlayStatesResponse;
import lombok.Data;

@Data
public class SpectateResponse {
    private int code;
    private GamePlayStatesResponse states;
}
