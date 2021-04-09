package io.github.hulang1024.chess.games.chinesechessdark;

import io.github.hulang1024.chess.games.chinesechess.ChineseChessGameSettings;
import lombok.Data;

@Data
public class ChineseChessDarkGameSettings extends ChineseChessGameSettings {
    private boolean fullRandom;

    @Override
    public boolean isEnableRanking() {
        return !fullRandom;
    }
}