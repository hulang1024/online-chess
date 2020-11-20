package io.github.hulang1024.chinesechess.user;

import lombok.Data;

@Data
public class LoginResult {
    private boolean ok;
    private String token;
    private long userId;

    public static LoginResult ok() {
        LoginResult ret = new LoginResult();
        ret.ok = true;
        return ret;
    }

    public static LoginResult failed() {
        return new LoginResult();
    }
}
