package io.github.hulang1024.chinesechess.user;

import lombok.Data;

@Data
public class RegisterResult {
    /**
     * 0=成功，1=失败，2=昵称已被使用，3=用户名格式错误，4=密码格式错误
     */
    private int code;

    public static RegisterResult ok() {
        RegisterResult ret = new RegisterResult();
        ret.code = 0;
        return ret;
    }

    public static RegisterResult fail(int code) {
        RegisterResult ret = new RegisterResult();
        ret.code = code;
        return ret;
    }
}
