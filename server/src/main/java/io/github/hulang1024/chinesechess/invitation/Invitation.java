package io.github.hulang1024.chinesechess.invitation;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chinesechess.user.User;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class Invitation {
    private Long id;

    /**
     * 邀请者
     */
    private User inviter;

    @JSONField(serialize = false)
    private User invitee;

    /**
     * 被邀请者
     */
    @NotNull
    @JSONField(serialize = false)
    private Long inviteeId;

    private SUBJECT subject;

    public static enum SUBJECT {
        PLAY,
        SPECTATE
    }
}

