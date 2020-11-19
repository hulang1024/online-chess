package io.github.hulang1024.chinesechessserver.room;

import com.alibaba.fastjson.JSONObject;
import io.github.hulang1024.chinesechessserver.chat.Channel;
import io.github.hulang1024.chinesechessserver.chat.ChannelManager;
import io.github.hulang1024.chinesechessserver.chat.ChannelType;
import io.github.hulang1024.chinesechessserver.database.entity.EntityUser;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoomManager {
    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ChannelManager channelManager;

    @Autowired
    private RoomEventListener roomEventListener;

    public List<Room> getRooms() {
        return null;
    }

    public Room getRoom(long id) {
        JSONObject jsonObject = (JSONObject)redisTemplate.opsForValue().get(String.valueOf(id));
        Room room = jsonObject.toJavaObject(Room.class);
        return room;
    }

    public Room create(Room room) {
        Room createdRoom = new Room();
        createdRoom.setId(nextRoomId());
        createdRoom.setName(room.getName());
        createdRoom.setPassword(room.getPassword());

        createdRoom.setCreateAt(LocalDateTime.now());

        // 为房间创建聊天频道
        Channel channel = new Channel();
        channel.setName(createdRoom.getId().toString());
        channel.setType(ChannelType.ROOM);
        channelManager.create(channel);

        // 创建者默认进入频道
        EntityUser creator = new EntityUser();
        creator.setId(createdRoom.getCreateBy());
        channel.joinUser(creator);

        // 房间关联频道
        createdRoom.setChannelId(channel.getId());

        // 创建者默认进入房间
        createdRoom.setUserIds(creator.getId().toString());

        // 房间数据放入缓存
        redisTemplate.opsForValue().set(createdRoom.getId().toString(), createdRoom);

        roomEventListener.onCreateRoom(room);
        
        return createdRoom;
    }

    public boolean update(Long roomId, RoomUpdateParam param) {
        JSONObject jsonObject = (JSONObject)redisTemplate.opsForValue().get(String.valueOf(roomId));
        Room room = jsonObject.toJavaObject(Room.class);
        if (StringUtils.isNotEmpty(param.getName())) {
            room.setName(param.getName());
        }
        if (StringUtils.isNotEmpty(param.getPassword())) {
            room.setPassword(param.getPassword());
        }

        redisTemplate.opsForValue().set(room.getId().toString(), room);

        return true;
    }

    public void joinUser(Room room, EntityUser user) {

    }

    public void removeUser(Room room, EntityUser user) {/*
        EntityRoom entityRoom = roomDao.selectById(room.getId());
        entityRoom.setUserIds();
        roomDao.update(null, new UpdateWrapper<EntityRoom>()
            .set(""))*/
    }

    private long nextRoomId() {
        return redisTemplate.opsForValue().increment("room:next_id", 1);
    }
}
