package io.github.hulang1024.chinesechessserver.message.server.chat;

import io.github.hulang1024.chinesechessserver.chat.Message;
import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class FetchMessagesResponse extends ServerMessage {
    private Message[] msgs;
    public FetchMessagesResponse() {
        super("chat.fetch_messages_response");
    }
}
