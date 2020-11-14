package io.github.hulang1024.chinesechessserver.message.server.chat;

import io.github.hulang1024.chinesechessserver.domain.chat.ChatMessage;
import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class FetchMessagesResponse extends ServerMessage {
    private ChatMessage[] msgs;
    public FetchMessagesResponse() {
        super("chat.fetch_messages_response");
    }
}
