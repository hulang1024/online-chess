package io.github.hulang1024.chinesechess.user;

import com.alibaba.fastjson.annotation.JSONField;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("users")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String nickname;

    private Integer gender;

    private String avatarUrl;

    @JSONField(serialize = false)
    private String password;

    @JSONField(name = "isAdmin")
    private boolean isAdmin;

    @JSONField(serialize = false)
    private int source;

    @JSONField(serialize = false)
    private String openId;

    @JSONField(serialize = false)
    private LocalDateTime registerTime;

    private LocalDateTime lastLoginTime;

    public static User SYSTEM_USER;
    static {
        User systemUser = new User();
        systemUser.setId(0L);
        systemUser.setNickname("系统");
        SYSTEM_USER = systemUser;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof User)) {
            return false;
        }

        return ((User)other).id.equals(this.id);
    }

    @Override
    public int hashCode() {
        return this.id.hashCode();
    }
}
