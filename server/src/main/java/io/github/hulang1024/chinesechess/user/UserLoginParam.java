package io.github.hulang1024.chinesechess.user;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class UserLoginParam {
    @NotBlank
    private String username;

    private String password;

    private String token;

    private String deviceOS;
}
