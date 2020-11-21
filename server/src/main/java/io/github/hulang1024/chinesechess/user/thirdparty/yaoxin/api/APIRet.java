package io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api;

import com.alibaba.fastjson.annotation.JSONField;
import lombok.Data;

/**
 * 爻信API结果
 * @param <T>
 */
@Data
public class APIRet<T> {
    private String id;
    @JSONField(name="request_id")
    private String requestId;
    private String type;
    private String action;
    private int code;
    private String message;

    @JSONField(deserialize=false)
    private T payload;

    public boolean isOk() {
        return code == 0;
    }
}
