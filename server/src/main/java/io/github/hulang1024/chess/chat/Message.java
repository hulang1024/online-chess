package io.github.hulang1024.chess.chat;

import io.github.hulang1024.chess.user.User;
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

    @Override
    public boolean equals(Object that) {
        if (this == that) {
            return true;
        }
        if (!(that instanceof Message)) {
            return false;
        }

        Message other = (Message)that;

        if (this.id != other.id) {
            return false;
        }

        return this.timestamp == other.timestamp;
    }
}