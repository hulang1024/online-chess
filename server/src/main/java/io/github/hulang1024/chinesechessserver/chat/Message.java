package io.github.hulang1024.chinesechessserver.chat;

import io.github.hulang1024.chinesechessserver.entity.User;
import io.github.hulang1024.chinesechessserver.utils.TimeUtils;
import lombok.Data;

@Data
public class ChatMessage {
    private long id;
    private long channelId;
    private User sender;
    private long timestamp;
    private String content;

    public ChatMessage() {
        id = TimeUtils.nowTimestamp();
    }
}
