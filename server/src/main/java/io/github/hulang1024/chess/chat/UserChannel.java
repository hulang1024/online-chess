package io.github.hulang1024.chess.chat;

import io.github.hulang1024.chess.user.User;
import lombok.Getter;
import lombok.Setter;

/**
 * 用户加入频道
 */
public class UserChannel {
    @Getter
    private User user;

    @Getter
    private Channel channel;

    /**
     * 最近已读消息id
     */
    @Getter
    @Setter
    private Long lastReadId;

    public UserChannel(User user, Channel channel) {
        this.channel = channel;
        this.user = user;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof UserChannel)) {
            return false;
        }
        UserChannel that = (UserChannel)other;
        return this.getUser().equals(that.getUser()) && this.channel.equals(that.getChannel());
    }
}