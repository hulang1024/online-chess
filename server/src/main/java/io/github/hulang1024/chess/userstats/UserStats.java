package io.github.hulang1024.chess.userstats;

import com.alibaba.fastjson.annotation.JSONField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("user_stats")
public class UserStats {
    public static final UserStats NULL = new UserStats();

    @JSONField(serialize = false)
    private Long userId;

    private int gameType;

    private long playCount;

    private long winCount;

    private long drawCount;

    private long loseCount;

    public float getWinRate() {
        return playCount > 0 ? (float)winCount / playCount * 100 : 0;
    }
}