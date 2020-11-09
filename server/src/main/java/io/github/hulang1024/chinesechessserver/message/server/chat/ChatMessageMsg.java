package io.github.hulang1024.chinesechessserver.message.server.chat;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class ChatMessageMsg extends ServerMessage {
    private long channelId;
    private long fromUid;
    private String fromUserNickname;
    private String content;

    public ChatMessageMsg() {
        super("chat.message");
    }
}
