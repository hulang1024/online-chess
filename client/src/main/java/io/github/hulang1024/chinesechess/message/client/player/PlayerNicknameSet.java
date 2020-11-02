package io.github.hulang1024.chinesechess.message.client.player;

import io.github.hulang1024.chinesechess.message.ClientMessage;
import lombok.Data;

@Data
public class PlayerNicknameSet extends ClientMessage {
    private String nickname;
    
    public PlayerNicknameSet() {
        super("player.nickname_set");
    }
}
