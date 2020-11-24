package io.github.hulang1024.chinesechess.chat.ws;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
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
        @JSONField(name = "isAdmin")
        private boolean isAdmin;
        private String nickname;
    }
}
