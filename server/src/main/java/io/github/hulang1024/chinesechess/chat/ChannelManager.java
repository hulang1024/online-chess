package io.github.hulang1024.chinesechess.chat;

import io.github.hulang1024.chinesechess.user.GuestUser;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserManager;
import io.github.hulang1024.chinesechess.user.UserSessionManager;
import io.github.hulang1024.chinesechess.websocket.message.MessageUtils;
import io.github.hulang1024.chinesechess.websocket.message.server.chat.ChatMessageServerMsg;
import org.apache.commons.lang3.ArrayUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChannelManager {
    private static Map<Long, Channel> channelMap = new ConcurrentHashMap<>();

    @Autowired
    private UserManager userManager;
    @Autowired
    private UserSessionManager userSessionManager;

    public static long[] defaultChannelIds = new long[]{
        /** 中国象棋 */
        1
    };

    static {
        new ChannelManager().createDefault(1);
    }

    /**
     *
     * @param channel
     * @param userId 小于0表示游客
     * @return
     */
    public boolean joinChannel(Channel channel, long userId) {
        if (channel == null) {
            return false;
        }

        User user = userId < 0
            ? userManager.getGuestUser(userId)
            : userManager.getOnlineUser(userId);
        if (user == null) {
            return false;
        }

        return joinChannel(channel, user);
    }

    public boolean joinChannel(Channel channel, User user) {
        if (user instanceof GuestUser) {
            if (!ArrayUtils.contains(defaultChannelIds, channel.getId())) {
                return false;
            }
        }
        if (userSessionManager.getSession(user) == null) {
            return false;
        }

        channel.joinUser(user);
        return true;
    }

    public void broadcast(Channel channel, Message message, User... excludes) {
        channel.addNewMessage(message);

        ChatMessageServerMsg msgMsg = new ChatMessageServerMsg();
        msgMsg.setId(message.getId());
        msgMsg.setChannelId(channel.getId());
        ChatMessageServerMsg.Sender sender = new ChatMessageServerMsg.Sender();
        sender.setId(message.getSender().getId());
        sender.setNickname(message.getSender().getNickname());
        msgMsg.setSender(sender);
        msgMsg.setContent(message.getContent());
        msgMsg.setTimestamp(message.getTimestamp());

        User exclude = excludes.length == 1 ? excludes[0] : null;
        channel.getUsers().forEach(user -> {
            if (user.equals(exclude)) {
                return;
            }
            MessageUtils.send(msgMsg, userSessionManager.getSession(user));
        });
    }

    public void remove(Channel channel) {
        channelMap.remove(channel.getId());
    }

    public Channel getChannelById(long id) {
        return channelMap.get(id);
    }


    public Channel create(Channel channel) {
        channel.setId(nextChannelId());
        channelMap.put(channel.getId(), channel);
        return channel;
    }

    private Channel createDefault(long id) {
        Channel channel = new Channel();
        channel.setId(id);
        channel.setType(ChannelType.PUBLIC);
        create(channel);
        return channel;
    }

    private static long nextChannelId = 20;
    private static long nextChannelId() {
        return ++nextChannelId;
    }
}
