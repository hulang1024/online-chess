package io.github.hulang1024.chinesechess.chat.ws;

import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.ws.message.ServerMessage;
import lombok.Data;

@Data
public class LeftChannelServerMsg extends ServerMessage {
    private long userId;
    private long channelId;

    public LeftChannelServerMsg(User user, Channel channel) {
        super("chat.left");

        this.userId = user.getId();
        this.channelId = channel.getId();
    }
}
