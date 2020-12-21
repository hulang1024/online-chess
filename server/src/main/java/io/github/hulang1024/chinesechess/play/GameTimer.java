package io.github.hulang1024.chinesechess.play;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chinesechess.room.RoomSettings;
import io.github.hulang1024.chinesechess.utils.TimeUtils;
import lombok.Data;

@Data
public class GameTimer {
    /**
     * 剩余局时（秒）
     */
    private int gameTime;

    /**
     * 最近剩余步时（秒）
     */
    private int stepTime;

    /** 最近步时开始计时时间 */
    @JSONField(serialize = false)
    private long startTime;

    @JSONField(serialize = false)
    private RoomSettings roomSettings;

    public GameTimer(RoomSettings roomSettings) {
        this.roomSettings = roomSettings;
        gameTime = roomSettings.getGameDuration();
        stepTime = roomSettings.getStepDuration();
    }

    public void start() {
        start(true);
    }

    public void pause() {
        stop();
    }

    public void resume() {
        start(false);
    }

    /**
     * 计算并减去用时
     */
    public void stop() {
        // start必须调用过
        if (startTime == 0) {
            return;
        }
        useTime();
        startTime = 0;
    }

    /**
     * 设置开始计时点
     */
    private void start(boolean resetStep) {
        startTime = TimeUtils.nowTimestamp();
        if (resetStep) {
            resetStepTime();
        }
    }

    /**
     * 计算并减最近步时使用的时间
     */
    public void useTime() {
        assert startTime != 0;
        long useTime = (TimeUtils.nowTimestamp() - startTime) / 1000;
        stepTime = (int)Math.max(stepTime - useTime, 0);
        gameTime = (int)Math.max(gameTime - useTime, 0);
        // 该方法可以重复调用，要设置开始计时点
        startTime = TimeUtils.nowTimestamp();
    }

    private void resetStepTime() {
        if (gameTime > 0) {
            stepTime = roomSettings.getStepDuration();
        } else {
            stepTime = roomSettings.getSecondsCountdown();
        }
    }
}
