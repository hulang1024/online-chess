package io.github.hulang1024.chinesechess.chat.ws;

import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class ChannelUserLeftServerMsg extends ServerMessage {
    private long userId;
    private long channelId;

    public ChannelUserLeftServerMsg(User user, Channel channel) {
        super("chat.user_left");

        this.userId = user.getId();
        this.channelId = channel.getId();
    }
}
