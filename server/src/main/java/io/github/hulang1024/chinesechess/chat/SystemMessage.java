package io.github.hulang1024.chinesechess.chat;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.utils.TimeUtils;

public class SystemMessage extends Message {
    private static long ID = -1;
    public SystemMessage(String content) {
        this.setId(ID--);
        this.setContent(content);
        this.setTimestamp(TimeUtils.nowTimestamp());
        this.setSender(User.SYSTEM_USER);
    }
}
