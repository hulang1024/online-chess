package io.github.hulang1024.chinesechess.play;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chinesechess.room.RoomSettings;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GameTiming {
    /**
     * 局时（秒）
     */
    private int game;
    /**
     * 步时（秒）
     */
    private int step;

    /** 步时开始计时时间 */
    @JSONField(serialize = false)
    private LocalDateTime beginTime;

    public void resume() {
        beginTime = LocalDateTime.now();
    }

    public void pause() {

    }

    public void minus(int time) {
        game -= time;
    }

    public static GameTiming from(RoomSettings roomSettings) {
        GameTiming times = new GameTiming();
        times.game = roomSettings.getGameDuration();
        times.step = roomSettings.getStepDuration();
        return times;
    }
}
