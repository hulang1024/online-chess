package io.github.hulang1024.chess.chat;

import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.utils.TimeUtils;

public class SystemMessage extends Message {
    private static long ID = -1;
    public SystemMessage(String content) {
        this.setId(ID--);
        this.setContent(content);
        this.setTimestamp(TimeUtils.nowTimestamp());
        this.setSender(User.SYSTEM_USER);
    }
}