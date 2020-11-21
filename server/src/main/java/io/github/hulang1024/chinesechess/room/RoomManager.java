package io.github.hulang1024.chinesechess.room;

import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.chat.ChannelType;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserManager;
import io.github.hulang1024.chinesechess.user.UserSessionManager;
import io.github.hulang1024.chinesechess.user.UserUtils;
import io.github.hulang1024.chinesechess.websocket.message.MessageUtils;
import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
import io.github.hulang1024.chinesechess.websocket.message.server.lobby.LobbyRoomCreateServerMsg;
import io.github.hulang1024.chinesechess.websocket.message.server.lobby.LobbyRoomUpdateServerMsg;
import io.github.hulang1024.chinesechess.websocket.message.server.room.JoinRoomServerMsg;
import io.github.hulang1024.chinesechess.websocket.message.server.room.LeaveRoomServerMsg;
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

    /** 房间id -> 房间 */
    private static Map<Long, Room> roomMap = new ConcurrentHashMap<>();

    /** 用户id -> 加入的房间 */
    private static Map<Long, Room> userJoinedRoomMap = new ConcurrentHashMap<>();

    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private UserManager userManager;
    @Autowired
    private UserSessionManager userSessionManager;
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
        return roomMap.get(id);
    }

    public Room getJoinedRoom(User user) {
        return userJoinedRoomMap.get(user.getId());
    }

    public Room getJoinedRoom(long userId) {
        return userJoinedRoomMap.get(userId);
    }

    /**
     * 创建房间
     * @param room
     * @return 创建的房间
     */
    public Room create(Room room) {
        User creator = UserUtils.get();

        if (getJoinedRoom(creator) != null) {
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

        roomMap.put(createdRoom.getId(), createdRoom);

        lobbyService.broadcast(new LobbyRoomCreateServerMsg(createdRoom), creator);

        // 创建者默认进入房间
        JoinRoomParam roomJoinParam = new JoinRoomParam();
        roomJoinParam.setPassword(room.getPassword());
        join(createdRoom, creator, roomJoinParam);

        return createdRoom;
    }


    /**
     * 加入房间
     * @param roomId
     * @param userId
     * @return
     */
    public JoinRoomResult join(long roomId, long userId, JoinRoomParam joinRoomParam) {
        User user = userManager.getOnlineUser(userId);
        Room room = getRoom(roomId);
        Room joinedRoom = getJoinedRoom(user);
        // 判断该用户是否早就已经加入了任何房间
        if (joinedRoom != null) {
            JoinRoomResult result = new JoinRoomResult();
            result.setCode(joinedRoom.getId().equals(roomId) ? 4 : 5);
            return result;
        }

        return join(room, user, joinRoomParam);
    }

    public JoinRoomResult join(Room room, User user, JoinRoomParam joinRoomParam) {
        JoinRoomResult result = new JoinRoomResult();
        result.setRoom(room);

        // 限定2个人
        if (room.getUserCount() == Room.MAX_PARTICIPANTS) {
            result.setCode(3);
            return result;
        }

        // 验证密码，如果有密码
        if (room.isLocked()) {
            if (joinRoomParam == null || !room.getPassword().equals(joinRoomParam.getPassword())) {
                result.setCode(6);
                return result;
            }
        }

        userJoinedRoomMap.put(user.getId(), room);

        room.joinUser(user);

        JoinRoomServerMsg joinRoomServerMsg = new JoinRoomServerMsg();
        joinRoomServerMsg.setRoom(room);
        joinRoomServerMsg.setUser(user);
        broadcast(room, joinRoomServerMsg, user);

        lobbyService.broadcast(new LobbyRoomUpdateServerMsg(room), user);

        return result;
    }

    /**
     * 离开房间
     * @param roomId
     * @param userId
     * @return 0=成功，2=未加入该房间
     */
    public int part(long roomId, long userId) {
        User user = userManager.getOnlineUser(userId);
        Room room = getJoinedRoom(userId);
        // 未加入该房间
        if (room == null) {
            return 2;
        }

        return part(room, user);
    }


    public int part(Room room, User user) {
        room.partUser(user);
        userJoinedRoomMap.remove(user.getId());

        // 如果全部离开了
        if (room.getUserCount() == 0) {
            channelManager.remove(room.getChannel());
            roomMap.remove(room.getId());
        }

        lobbyService.broadcast(new LobbyRoomUpdateServerMsg(room), user);

        // 离开消息发送给已在此房间的用户
        LeaveRoomServerMsg leaveRoomMsg = new LeaveRoomServerMsg();
        leaveRoomMsg.setUser(user);
        broadcast(room, leaveRoomMsg);

        return 0;
    }

    public boolean update(Long roomId, RoomUpdateParam param) {
        Room room = getRoom(roomId);
        if (StringUtils.isNotEmpty(param.getName())) {
            room.setName(param.getName());
        }
        if (StringUtils.isNotEmpty(param.getPassword())) {
            room.setPassword(param.getPassword());
        }

        lobbyService.broadcast(new LobbyRoomUpdateServerMsg(room), null);
        return true;
    }

    public void broadcast(Room room, ServerMessage message) {
        broadcast(room, message, null);
    }

    public void broadcast(Room room, ServerMessage message, User exclude) {
        room.getUsers().forEach(user -> {
            if (user.equals(exclude)) {
                return;
            }
            MessageUtils.send(message, userSessionManager.getSession(user));
        });
        room.getSpectators().forEach(user -> {
            if (user.equals(exclude)) {
                return;
            }
            MessageUtils.send(message, userSessionManager.getSession(user));
        });
    }



    private static long nextRoomId = 1000;
    private long nextRoomId() {
        return ++nextRoomId;
        //return redisTemplate.opsForValue().increment("room:next_id", 1);
    }
}
