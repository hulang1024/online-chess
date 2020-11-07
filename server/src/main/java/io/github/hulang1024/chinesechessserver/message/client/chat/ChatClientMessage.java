package io.github.hulang1024.chinesechessserver.message.client.chat;

import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import io.github.hulang1024.chinesechessserver.message.client.MessageType;
import lombok.Data;

@Data
@MessageType("chat.message")
public class ChatClientMessage extends ClientMessage {
    private String content;
}
