package io.github.hulang1024.chinesechessserver.http.params;

import lombok.Data;

import javax.validation.constraints.NotEmpty;

@Data
public class UserLoginParam {
    @NotEmpty
    private String username;

    @NotEmpty
    private String password;
}
