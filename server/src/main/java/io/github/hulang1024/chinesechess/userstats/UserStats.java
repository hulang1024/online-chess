package io.github.hulang1024.chinesechess.userstats;

import com.alibaba.fastjson.annotation.JSONField;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("user_stats")
public class UserStats {
    @JSONField(serialize = false)
    @TableId(type = IdType.INPUT)
    private Long userId;

    private long playCount;

    private long winCount;

    private long drawCount;

    private long loseCount;
}
