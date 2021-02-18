package io.github.hulang1024.chess.user.ws;

import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class OnlineStatServerMsg extends ServerMessage {
    private long online;
    private long guest;

    public OnlineStatServerMsg(long online, long guest) {
        super("stat.online");
        this.online = online;
        this.guest = guest;
    }
}