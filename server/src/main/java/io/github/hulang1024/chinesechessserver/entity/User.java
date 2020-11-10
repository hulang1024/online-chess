package io.github.hulang1024.chinesechessserver.entity;

import lombok.Data;

@Data
public class User {
    private Long id;
    private String username;
    private String nickname;

    public static User SYSTEM_USER = new User(0, "系统");

    public User() {}
    private User(long id, String nickname) {
        this.id = id;
        this.nickname = nickname;
    }
}
