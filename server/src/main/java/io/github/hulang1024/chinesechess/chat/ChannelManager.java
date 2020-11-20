package io.github.hulang1024.chinesechess.chat;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChannelManager {
    //@Resource
    //private RedisTemplate<String, Object> redisTemplate;

    private static Map<Long, Channel> channelMap = new ConcurrentHashMap<>();

    static {
        new ChannelManager().createDefault(1);
    }

    public void remove(Long id) {
        //redisTemplate.delete(id.toString());
        channelMap.remove(id);
    }

    public Channel getChannelById(Long id) {
        //JSONObject jsonObject = (JSONObject)redisTemplate.opsForValue().get(id.toString());
        //return jsonObject.toJavaObject(Channel.class);
        return channelMap.get(id);
    }


    public Channel create(Channel channel) {
        channel.setId(nextChannelId());
        /*
        if (redisTemplate.hasKey(channel.getId().toString())) {
            return;
        }
        redisTemplate.opsForValue().set(channel.getId().toString(), channel);*/
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
    private static long nextChannelId() {/*
        final String key = "chat:channel:next_id";
        if (redisTemplate.hasKey(key)) {
            return redisTemplate.opsForValue().increment(key);
        } else {
            redisTemplate.opsForValue().set(key, 21);
            return 21;
        }*/
        return ++nextChannelId;
    }
}
