package io.github.hulang1024.chinesechessserver.user;

import lombok.Data;

@Data
public class LoginResult {
    private boolean ok;
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
