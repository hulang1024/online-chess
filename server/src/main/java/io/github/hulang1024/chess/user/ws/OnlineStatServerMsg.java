package io.github.hulang1024.chess.user.ws;

import io.github.hulang1024.chess.user.UserOnlineCounter;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class OnlineStatServerMsg extends ServerMessage {
    private long online;
    private long pc;
    private long mobile;
    private long guest;

    public OnlineStatServerMsg() {
        super("stat.online");
        this.online = UserOnlineCounter.online;
        this.guest = UserOnlineCounter.guest;
        this.pc = UserOnlineCounter.pc;
        this.mobile = UserOnlineCounter.mobile;
    }
}