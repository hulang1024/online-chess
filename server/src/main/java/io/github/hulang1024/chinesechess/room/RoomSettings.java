package io.github.hulang1024.chinesechess.room;

import lombok.Data;

/**
 * 房间设置
 */
@Data
public class RoomSettings {
    /**
     * 局时（分钟）
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
