package io.github.hulang1024.chinesechess.chat;

import io.github.hulang1024.chinesechess.user.User;
import lombok.Data;

@Data
public class Message {
    private long id;
    private long channelId;
    private User sender;
    private long timestamp;
    private String content;

    private static long ID = 1;

    public Message() {
        id = ID++;
    }
}
