package io.github.hulang1024.chinesechess.user;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;

@Data
public class UserRegisterParam {
    @NotEmpty
    private String nickname;

    @NotBlank
    private String password;
}
