package io.github.hulang1024.chinesechessserver.message.client.user;

import io.github.hulang1024.chinesechessserver.message.ClientMessage;
import io.github.hulang1024.chinesechessserver.message.client.MessageType;
import lombok.Data;

@Data
@MessageType("user.nickname_set")
public class UserNicknameSet extends ClientMessage {
    private String nickname;
}
