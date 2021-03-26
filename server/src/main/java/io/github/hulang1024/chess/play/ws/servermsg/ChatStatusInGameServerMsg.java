package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class ChatStatusInGameServerMsg extends ServerMessage {
    private long uid;
    private boolean typing;

    public ChatStatusInGameServerMsg(long uid, boolean typing) {
        super("play.chat_status");
        this.uid = uid;
        this.typing = typing;
    }
}