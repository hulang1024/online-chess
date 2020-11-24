package io.github.hulang1024.chinesechess.user.login;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;

@Data
public class UserLoginParam {
    @NotEmpty
    private String username;

    @NotBlank
    private String password;
}
