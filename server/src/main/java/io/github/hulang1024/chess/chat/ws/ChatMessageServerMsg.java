package io.github.hulang1024.chess.chat.ws;

import io.github.hulang1024.chess.chat.Message;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class ChatMessageServerMsg extends ServerMessage {
    private Message message;

    public ChatMessageServerMsg(Message message) {
        super("chat.message");
        this.message = message;
    }
}