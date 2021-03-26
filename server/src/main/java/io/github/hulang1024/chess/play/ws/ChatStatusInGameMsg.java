package io.github.hulang1024.chess.play.ws;

import io.github.hulang1024.chess.ws.ClientMessage;
import io.github.hulang1024.chess.ws.ClientMsgType;
import lombok.Data;

@Data
@ClientMsgType("play.chat_status")
public class ChatStatusInGameMsg extends ClientMessage {
    private boolean typing;

    public ChatStatusInGameMsg(boolean typing) {
        this.typing = typing;
    }
}