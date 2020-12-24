package io.github.hulang1024.chinesechess.user;

import lombok.Data;

@Data
public class UserLoginParam {
    private String username;

    private String password;

    private String token;

    private String deviceOS;
}
