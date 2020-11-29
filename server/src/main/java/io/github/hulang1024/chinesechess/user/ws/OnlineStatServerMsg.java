package io.github.hulang1024.chinesechess.user.ws;

import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class OnlineStatServerMsg extends ServerMessage {
    private long online;

    public OnlineStatServerMsg(long online) {
        super("stat.online");
        this.online = online;
    }
}
