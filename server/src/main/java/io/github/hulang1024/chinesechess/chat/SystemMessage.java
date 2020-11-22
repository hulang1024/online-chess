package io.github.hulang1024.chinesechess.chat;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.utils.TimeUtils;

public class SystemMessage extends Message {
    public SystemMessage(String content) {
        this.setContent(content);
        this.setTimestamp(TimeUtils.nowTimestamp());
        this.setSender(User.SYSTEM_USER);
    }
}
