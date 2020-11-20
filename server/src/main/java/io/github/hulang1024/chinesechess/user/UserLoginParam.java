package io.github.hulang1024.chinesechess.user;

import lombok.Data;

import javax.validation.constraints.NotEmpty;

@Data
public class UserLoginParam {
    @NotEmpty
    private String username;

    @NotEmpty
    private String password;
}
