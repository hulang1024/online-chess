package io.github.hulang1024.chinesechessserver.message.server.stat;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class OnlineStatMessage extends ServerMessage {
    private long online;

    public OnlineStatMessage() {
        super("stat.online");
    }
}
