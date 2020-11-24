package io.github.hulang1024.chinesechess.play.ws.servermsg;

import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import lombok.Data;

@Data
public class OfflineContinueServerMsg extends ServerMessage {
    private boolean ok;
    private long uid;

    public OfflineContinueServerMsg() {
        super("play.offline_continue");
    }
}
