package io.github.hulang1024.chess.user.ws;

import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class UserOfflineServerMsg extends ServerMessage {
    private long uid;
    private String nickname;

    public UserOfflineServerMsg(User user) {
        super("user.offline");
        this.uid = user.getId();
        this.nickname = user.getNickname();
    }
}