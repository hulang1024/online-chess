package io.github.hulang1024.chinesechessserver.message.server.chat;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class ChatMessage extends ServerMessage {
    private String content;

    public ChatMessage() {
        super("chat.message");
    }
}
