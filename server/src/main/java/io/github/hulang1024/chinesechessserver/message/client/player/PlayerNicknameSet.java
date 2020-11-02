package io.github.hulang1024.chinesechessserver.message.client.player;

import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import io.github.hulang1024.chinesechessserver.message.client.MessageType;
import lombok.Data;

@Data
@MessageType("player.nickname_set")
public class PlayerNicknameSet extends ClientMessage {
    private String nickname;
}
