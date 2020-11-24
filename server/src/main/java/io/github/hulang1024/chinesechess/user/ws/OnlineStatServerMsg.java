package io.github.hulang1024.chinesechess.user.ws;

import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import lombok.Data;

@Data
public class OnlineStatServerMsg extends ServerMessage {
    private long online;

    public OnlineStatServerMsg() {
        super("stat.online");
    }
}
