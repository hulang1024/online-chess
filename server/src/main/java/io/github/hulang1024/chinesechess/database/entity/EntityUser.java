package io.github.hulang1024.chinesechess.database.entity;

import com.alibaba.fastjson.annotation.JSONField;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("users")
public class EntityUser {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String nickname;

    @JsonIgnore
    @JSONField(serialize = false)
    private String password;

    private LocalDateTime registerTime;

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof EntityUser)) {
            return false;
        }

        return ((EntityUser)other).id.equals(this.id);
    }

    @Override
    public int hashCode() {
        return this.id.hashCode();
    }
}
