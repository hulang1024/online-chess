package io.github.hulang1024.chinesechessserver.chat;

import com.alibaba.fastjson.JSONObject;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

@Service
public class ChannelManager {
    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    public void remove(Long id) {
        redisTemplate.delete(id.toString());
    }

    public Channel getChannelById(Long id) {
        JSONObject jsonObject = (JSONObject)redisTemplate.opsForValue().get(id.toString());
        return jsonObject.toJavaObject(Channel.class);
    }


    public void create(Channel channel) {
        channel.setId(nextChannelId());
        if (redisTemplate.hasKey(channel.getId().toString())) {
            return;
        }
        redisTemplate.opsForValue().set(channel.getId().toString(), channel);
    }

    public void joinChannel(Channel channel, long userId) {

    }

    private Channel createDefault(long id) {
        Channel channel = new Channel();
        channel.setId(id);
        channel.setType(ChannelType.PUBLIC);
        create(channel);
        return channel;
    }

    private long nextChannelId() {
        final String key = "chat:channel:next_id";
        if (redisTemplate.hasKey(key)) {
            return redisTemplate.opsForValue().increment(key);
        } else {
            redisTemplate.opsForValue().set(key, 21);
            return 21;
        }
    }
}
