package io.github.hulang1024.chinesechess.message.server.stat;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import lombok.Data;

@Data
public class OnlineStatServerMsg extends ServerMessage {
    private long online;

    public OnlineStatServerMsg() {
        super("stat.online");
    }
}
