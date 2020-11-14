package io.github.hulang1024.chinesechessserver.message.client.chat;

import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import io.github.hulang1024.chinesechessserver.message.client.MessageType;
import lombok.Data;


@Data
@MessageType("chat.fetch_messages")
public class FetchMessage extends ClientMessage {
    private long channelId;
}
