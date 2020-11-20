package io.github.hulang1024.chinesechess.message.server.chat;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import lombok.Data;

@Data
public class ChatMessageServerMsg extends ServerMessage {
    private long id;
    private long channelId;
    private long timestamp;
    private Sender sender;
    private String content;

    public ChatMessageServerMsg() {
        super("chat.message");
    }

    @Data
    public static class Sender {
        private long id;
        private String nickname;
    }
}
