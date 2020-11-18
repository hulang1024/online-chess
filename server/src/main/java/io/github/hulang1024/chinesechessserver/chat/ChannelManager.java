package io.github.hulang1024.chinesechessserver.chat;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import io.github.hulang1024.chinesechessserver.dao.mapper.ChannelDao;
import io.github.hulang1024.chinesechessserver.entity.Channel;
import org.springframework.beans.factory.annotation.Autowired;

public class ChatChannelManager {
    @Autowired
    private ChannelDao channelDao;

    private static Map<Long, ChatChannel> chatChannelMap = new ConcurrentHashMap<>();
    private static long currentId = 20;

    private static ChatChannel global = createPublic(1);

    /**
     * 返回全局聊天频道，id为1
     * @return
     */
    public static ChatChannel getGlobal() {
        return global;
    }

    public static ChatChannel create(ChannelType type) {
        ChatChannel channel = new ChatChannel(++currentId, type);
        chatChannelMap.put(channel.getId(), channel);
        return channel;
    }

    public static void remove(long id) {
        chatChannelMap.remove(id);
    }

    public static ChatChannel getChannelById(long id) {
        return chatChannelMap.get(id);
    }


    private static ChatChannel createPublic(long id) {
        ChatChannel channel = new ChatChannel(id, ChannelType.PUBLIC);
        chatChannelMap.put(channel.getId(), channel);
        return channel;
    }

    private void create(Channel channel) {
        channelDao.insert(channel);
    }

}
