package io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api;

import com.alibaba.fastjson.annotation.JSONField;
import lombok.Data;

@Data
public class AccessToken {
    @JSONField(name="access_token")
    private String accessToken;

    @JSONField(name="expires_in")
    private long expiresIn;
}
