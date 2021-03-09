package io.github.hulang1024.chess.games;

import com.alibaba.fastjson.annotation.JSONField;
import lombok.Data;

@Data
public class GameSettings {
    @JSONField(serialize = false)
    private GameType gameType;
    private boolean canWithdraw;
    private TimerSettings timer;

    @Data
    public static class TimerSettings {
        /**
         * 局时（秒）
         */
        private int gameDuration;
        /**
         * 步时（秒）
         */
        private int stepDuration;
        /**
         * 读秒
         */
        private int secondsCountdown;
    }

    @JSONField(name = "gameType")
    public int getGameTypeCode() {
        return gameType.getCode();
    }
}