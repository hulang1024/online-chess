package io.github.hulang1024.chinesechessserver.database.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class User {
    private Long id;
    private String username;
    private String nickname;
    private LocalDateTime registerTime;

    public static User SYSTEM_USER = new User(0, "系统");

    public User() {}
    private User(long id, String nickname) {
        this.id = id;
        this.nickname = nickname;
    }
}
