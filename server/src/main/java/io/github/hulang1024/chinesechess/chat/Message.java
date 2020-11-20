package io.github.hulang1024.chinesechess.chat;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.utils.TimeUtils;
import lombok.Data;

@Data
public class Message {
    private long id;
    private long channelId;
    private User sender;
    private long timestamp;
    private String content;

    public Message() {
        id = TimeUtils.nowTimestamp();
    }
}
