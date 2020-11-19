package io.github.hulang1024.chinesechessserver.database.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import javax.validation.constraints.NotEmpty;
import java.time.LocalDateTime;

@Data
@TableName("users")
public class EntityUser {
    private Long id;

    @NotEmpty
    private String nickname;

    @NotEmpty
    private String password;

    private LocalDateTime registerTime;

    public static EntityUser SYSTEM_USER = new EntityUser(0, "系统");

    public EntityUser() {}
    private EntityUser(long id, String nickname) {
        this.id = id;
        this.nickname = nickname;
    }
}
