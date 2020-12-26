package io.github.hulang1024.chinesechess.invitation;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chinesechess.user.User;
import lombok.Data;

@Data
public class Reply {
    private User invitee;

    @JSONField(serialize = false)
    private Long invitationId;

    private boolean isAccept;
}
