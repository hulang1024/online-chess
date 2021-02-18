package io.github.hulang1024.chess.chat.ws;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.ws.ServerMessage;
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

    public void setSender(User user) {
        this.sender = new Sender(user);
    }

    @Data
    private static class Sender {
        private long id;
        @JSONField(name = "isAdmin")
        private boolean isAdmin;
        private String nickname;

        private Sender(User user) {
            this.id = user.getId();
            this.isAdmin = user.isAdmin();
            this.nickname = user.getNickname();
        }
    }
}