package io.github.hulang1024.chinesechess.message.server.player;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import io.github.hulang1024.chinesechess.message.server.MessageType;
import lombok.Data;

@Data
@MessageType("player.nickname_set")
public class PlayerNicknameSetResult extends ServerMessage {
    private String nickname;
}
