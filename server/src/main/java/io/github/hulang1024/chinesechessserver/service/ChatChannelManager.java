package io.github.hulang1024.chinesechessserver.service;

import java.util.HashMap;
import java.util.Map;

import io.github.hulang1024.chinesechessserver.domain.chat.ChatChannel;

public class ChatChannelManager {
    private static Map<Long, ChatChannel> chatChannelMap = new HashMap<>();
    private static long currentId = 20;

    private static ChatChannel global = create(1);

    /**
     * 返回全局聊天频道，id为1
     * @return
     */
    public static ChatChannel getGlobal() {
        return global;
    }

    public static ChatChannel create() {
        ChatChannel channel = new ChatChannel(++currentId);
        chatChannelMap.put(channel.getId(), channel);
        return channel;
    }

    public static void remove(long id) {
        chatChannelMap.remove(id);
    }

    public static ChatChannel getChannelById(long id) {
        return chatChannelMap.get(id);
    }


    private static ChatChannel create(long id) {
        ChatChannel channel = new ChatChannel(id);
        chatChannelMap.put(channel.getId(), channel);
        return channel;
    }
}
