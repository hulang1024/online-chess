package io.github.hulang1024.chinesechess.room;

import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.chat.ChannelType;
import io.github.hulang1024.chinesechess.message.server.lobby.LobbyRoomRemoveServerMsg;
import io.github.hulang1024.chinesechess.message.server.lobby.LobbyRoomUpdateServerMsg;
import io.github.hulang1024.chinesechess.message.server.lobby.LobbyRoomCreateServerMsg;
import io.github.hulang1024.chinesechess.message.server.room.JoinRoomServerMsg;
import io.github.hulang1024.chinesechess.message.server.room.LeaveRoomServerMsg;
import io.github.hulang1024.chinesechess.play.rule.ChessHost;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class RoomManager {
    //@Resource
    //private RedisTemplate<String, Object> redisTemplate;

    private static Map<Long, Room> roomMap = new ConcurrentHashMap<>();

    @Autowired
    private ChannelManager channelManager;

    @Autowired
    private LobbyService lobbyService;

    public List<Room> getRooms() {
        return roomMap.values().stream()
            .sorted((a, b) -> {
                int ret = a.getUserCount() - b.getUserCount();
                if (ret == 0) {
                    return b.getCreateAt().compareTo(a.getCreateAt());
                }
                return ret;
            })
            .collect(Collectors.toList());
    }

    public Room getRoom(long id) {
        //JSONObject jsonObject = (JSONObject)redisTemplate.opsForValue().get(String.valueOf(id));
        //Room room = jsonObject.toJavaObject(Room.class);
        //return room;
        return roomMap.get(id);
    }

    /**
     * 创建房间
     * @param room
     * @return 创建的房间
     */
    public Room create(Room room) {
        User creator = UserUtils.get();

        if (creator.isJoinedAnyRoom()) {
            return null;
        }

        Room createdRoom = new Room();
        createdRoom.setId(nextRoomId());
        if (StringUtils.isNotEmpty(room.getName())) {
            createdRoom.setName(room.getName());
        } else {
            createdRoom.setName(createdRoom.getId().toString());
        }
        createdRoom.setPassword(room.getPassword());
        createdRoom.setCreateBy(creator.getId());
        createdRoom.setCreateAt(LocalDateTime.now());
        createdRoom.setOwner(creator);

        // 为房间创建聊天频道
        Channel channel = new Channel();
        channel.setName(createdRoom.getId().toString());
        channel.setType(ChannelType.ROOM);
        channelManager.create(channel);

        createdRoom.setChannel(channel);

        creator.setReadied(true);

        // 房间数据放入缓存
        //redisTemplate.opsForValue().set(createdRoom.getId().toString(), createdRoom);
        roomMap.put(createdRoom.getId(), createdRoom);

        lobbyService.broadcast(new LobbyRoomCreateServerMsg(createdRoom), creator);

        // 创建者默认进入房间
        JoinRoomParam roomJoinParam = new JoinRoomParam();
        roomJoinParam.setPassword(room.getPassword());
        join(createdRoom, creator, roomJoinParam);

        return createdRoom;
    }


    /**
     *
     * @param room
     * @param user
     * @return
     */
    public JoinRoomResult join(Room room, User user, JoinRoomParam joinParam) {
        JoinRoomResult result = new JoinRoomResult();
        result.setRoom(room);

        // 判断该用户是否已经加入了任何房间
        if (user.isJoinedAnyRoom()) {
            result.setCode(user.getJoinedRoom().getId().equals(room.getId()) ? 4 : 5);
            return result;
        }

        // 限定2个人
        if (room.getUserCount() == 2) {
            result.setCode(3);
            return result;
        }

        // 验证密码，如果有密码
        if (room.isLocked()) {
            if (joinParam == null || !room.getPassword().equals(joinParam.getPassword())) {
                result.setCode(6);
                return result;
            }
        }

        // 设置棋方
        if (room.getUserCount() == 0) {
            user.setChessHost(ChessHost.RED);
        } else {
            User otherUser = room.getUsers().get(0);
            user.setChessHost(otherUser.getChessHost().reverse());
        }

        user.joinRoom(room);

        JoinRoomServerMsg joinRoomServerMsg = new JoinRoomServerMsg();
        joinRoomServerMsg.setRoom(room);
        joinRoomServerMsg.setUser(user);
        room.broadcast(joinRoomServerMsg, user);

        lobbyService.broadcast(new LobbyRoomUpdateServerMsg(room), user);

        return result;
    }

    /**
     * 离开房间
     * @param room
     * @param user
     * @return 0=成功，2=未加入该房间
     */
    public int part(Room room, User user) {
        // 未加入该房间
        if (!user.isJoinedAnyRoom()) {
            return 2;
        }

        user.partRoom();

        // 对局状态置为空
        room.setRound(null);

        // 如果全部离开了
        if (room.getUserCount() == 0) {
            // 删除房间
            roomMap.remove(room.getId());

            lobbyService.broadcast(new LobbyRoomRemoveServerMsg(room), user);
        } else {
            // 房主变成留下的人
            User aloneUser = room.getUsers().get(0);
            room.setOwner(aloneUser);
            aloneUser.setChessHost(user.getChessHost().reverse());

            lobbyService.broadcast(new LobbyRoomUpdateServerMsg(room), user);
        }

        // 离开消息发送给已在此房间的用户
        LeaveRoomServerMsg leaveRoomMsg = new LeaveRoomServerMsg();
        leaveRoomMsg.setUser(user);
        room.broadcast(leaveRoomMsg);

        return 0;
    }

    public boolean update(Long roomId, RoomUpdateParam param) {
        //JSONObject jsonObject = (JSONObject)redisTemplate.opsForValue().get(String.valueOf(roomId));
        //Room room = jsonObject.toJavaObject(Room.class);
        Room room = getRoom(roomId);
        if (StringUtils.isNotEmpty(param.getName())) {
            room.setName(param.getName());
        }
        if (StringUtils.isNotEmpty(param.getPassword())) {
            room.setPassword(param.getPassword());
        }

        //redisTemplate.opsForValue().set(room.getId().toString(), room);

        return true;
    }

    private static long nextRoomId = 1000;
    private long nextRoomId() {
        return ++nextRoomId;
        //return redisTemplate.opsForValue().increment("room:next_id", 1);
    }
}
