package io.github.hulang1024.chinesechessserver.message.server.player;

import io.github.hulang1024.chinesechessserver.message.ServerMessage;
import lombok.Data;

@Data
public class PlayerNicknameSetResult extends ServerMessage {
    private String nickname;
    
    public PlayerNicknameSetResult() {
        super("player.nickname_set");
    }
}
