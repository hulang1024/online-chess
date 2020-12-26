package io.github.hulang1024.chinesechess.user;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chinesechess.http.results.Result;
import lombok.Data;

@Data
public class RegisterResult extends Result {
    @JSONField(serialize = false)
    private User user;

    /**
     *
     * @param code 0=成功，1=失败，2=昵称已被使用，3=用户名格式错误，4=密码格式错误
     */
    public RegisterResult(int code) {
        super(code);
    }

    public static RegisterResult ok(User user) {
        RegisterResult ret = new RegisterResult(0);
        ret.user = user;
        return ret;
    }

    public static RegisterResult fail(int code) {
        return new RegisterResult(code);
    }
}
