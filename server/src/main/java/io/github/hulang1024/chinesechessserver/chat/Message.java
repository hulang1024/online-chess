package io.github.hulang1024.chinesechessserver.chat;

import io.github.hulang1024.chinesechessserver.database.entity.EntityUser;
import io.github.hulang1024.chinesechessserver.utils.TimeUtils;
import lombok.Data;

@Data
public class Message {
    private long id;
    private long channelId;
    private EntityUser sender;
    private long timestamp;
    private String content;

    public Message() {
        id = TimeUtils.nowTimestamp();
    }
}
