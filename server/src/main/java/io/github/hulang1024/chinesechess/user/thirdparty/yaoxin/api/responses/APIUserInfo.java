package io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api.responses;

import com.alibaba.fastjson.annotation.JSONField;
import lombok.Data;

@Data
public class APIUserInfo {
    @JSONField(name="open_id")
    private String openId;
    private String nickname;
    /**
     * 性别MALE(男)FEMALE(女)
     */
    private String gender;
    private String phone;
    /**
     * 所在地区
     */
    @JSONField(name="show_area")
    private String showArea;

    /**
     * 头像URL
     */
    private String avatar;
}
