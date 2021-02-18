package io.github.hulang1024.chess.room;

import io.github.hulang1024.chess.chat.Channel;
import io.github.hulang1024.chess.chat.ChannelManager;
import io.github.hulang1024.chess.chat.ChannelType;
import io.github.hulang1024.chess.chat.InfoMessage;
import io.github.hulang1024.chess.chat.ws.ChatUpdatesServerMsg;
import io.github.hulang1024.chess.play.GameState;
import io.github.hulang1024.chess.room.ws.*;
import io.github.hulang1024.chess.spectator.SpectatorManager;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.user.UserManager;
import io.github.hulang1024.chess.user.UserSessionManager;
import io.github.hulang1024.chess.user.UserUtils;
import io.github.hulang1024.chess.user.activity.UserActivity;
import io.github.hulang1024.chess.user.activity.UserActivityService;
import io.github.hulang1024.chess.ws.ServerMessage;
import io.github.hulang1024.chess.ws.WSMessageService;
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
    private SpectatorManager spectatorManager;
    @Autowired
    private UserSessionManager userSessionManager;
    @Autowired
    private UserActivityService userActivityService;

    @Autowired
    private WSMessageService wsMessageService;

    public List<Room> searchRooms(SearchRoomParam searchRoomParam) {
        List<Room> rooms;
        if (searchRoomParam != null) {
            rooms = roomMap.values().stream()
                .filter(room -> {
                    boolean ret = true;
                    if (searchRoomParam.getStatus() != null) {
                        ret = ret && room.getStatus().code == searchRoomParam.getStatus();
                    }
                    if (searchRoomParam.getRequirePassword() != null) {
                        ret = ret &&
                            (StringUtils.isNotEmpty(room.getPassword()) == searchRoomParam.getRequirePassword());
                    }
                    return ret;
                })
                .collect(Collectors.toList());
        } else {
            rooms = roomMap.values().stream().collect(Collectors.toList());
        }
        rooms = rooms.stream()
            .sorted((a, b) -> {
                int ret = a.getUserCount() - b.getUserCount();
                if (ret == 0) {
                    return b.getCreateAt().compareTo(a.getCreateAt());
                }
                return ret;
            })
            .collect(Collectors.toList());

        return rooms;
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
     * @param createRoomParam
     * @return 创建的房间
     */
    public Room createRoom(CreateRoomParam createRoomParam) {
        User creator = UserUtils.get();

        if (!userManager.isOnline(creator)) {
            return null;
        }

        if (getJoinedRoom(creator) != null) {
            return null;
        }

        Room createdRoom = new Room(channelManager, userManager);
        createdRoom.setId(nextRoomId());
        if (StringUtils.isNotBlank(createRoomParam.getName())) {
            createdRoom.setName(createRoomParam.getName());
        } else {
            createdRoom.setName(createdRoom.getId().toString());
        }

        createdRoom.setRoomSettings(createRoomParam.getRoomSettings());

        createdRoom.setPassword(createRoomParam.getPassword());
        createdRoom.setCreateBy(creator.getId());
        createdRoom.setCreateAt(LocalDateTime.now());
        createdRoom.setOwner(creator);

        // 为房间创建聊天频道
        Channel channel = new Channel();
        channel.setName("#当前房间");
        channel.setType(ChannelType.ROOM);
        channelManager.createChannel(channel);

        createdRoom.setChannel(channel);

        roomMap.put(createdRoom.getId(), createdRoom);

        // 创建者默认进入房间
        JoinRoomParam roomJoinParam = new JoinRoomParam();
        roomJoinParam.setPassword(createRoomParam.getPassword());
        joinRoom(createdRoom, creator, roomJoinParam);

        userActivityService.broadcast(UserActivity.IN_LOBBY, new LobbyRoomCreateServerMsg(createdRoom));

        return createdRoom;
    }

    /**
     * 加入房间
     * @param roomId
     * @param userId
     * @return
     */
    public JoinRoomResult joinRoom(long roomId, long userId, JoinRoomParam joinRoomParam) {
        Room room = getRoom(roomId);
        if (room == null) {
            return JoinRoomResult.fail(7);
        }

        User user = userManager.getLoggedInUser(userId);

        return joinRoom(room, user, joinRoomParam);
    }

    public JoinRoomResult joinRoom(Room room, User user, JoinRoomParam joinRoomParam) {
        if (!userManager.isOnline(user)) {
            return JoinRoomResult.fail(2);
        }

        Room joinedRoom = getJoinedRoom(user);
        if (joinedRoom != null) {
            // 早就在其它房间
            if (joinedRoom.getGame() == null || joinedRoom.getGame().getState() == GameState.READY) {
                // 不在游戏中现在就退出
                partRoom(joinedRoom, user);
            } else {
                return JoinRoomResult.fail(joinedRoom.getId().equals(room.getId()) ? 4 : 5);
            }
        }

        Room spectatingRoom = spectatorManager.getSpectatingRoom(user);
        if (spectatingRoom != null) {
            // 在观看其它房间，退出
            spectatorManager.leaveRoom(user, spectatingRoom);
        }

        if (room.isFull()) {
            return JoinRoomResult.fail(3);
        }

        // 验证密码，如果有密码
        if (room.isLocked()) {
            if (joinRoomParam == null || !room.getPassword().equals(joinRoomParam.getPassword())) {
                return JoinRoomResult.fail(6);
            }
        }

        userJoinedRoomMap.put(user.getId(), room);

        room.joinUser(user);
        userActivityService.enter(user, UserActivity.IN_ROOM);

        broadcast(room, new RoomUserJoinServerMsg(user), user);

        if (!room.getOwner().equals(user)) {
            userActivityService.broadcast(UserActivity.IN_LOBBY, new LobbyRoomUpdateServerMsg(room), user);
        }

        ChatUpdatesServerMsg chatUpdatesServerMsg = new ChatUpdatesServerMsg();
        chatUpdatesServerMsg.setChannel(room.getChannel());
        chatUpdatesServerMsg.setRecentMessages(room.getChannel().getMessages());
        wsMessageService.send(chatUpdatesServerMsg, user);

        channelManager.broadcast(room.getChannel(), new InfoMessage(user.getNickname() + " 加入房间"));
        return JoinRoomResult.ok(room);
    }

    /**
     * 离开房间
     * @param roomId
     * @param userId
     * @return 0=成功，2=未加入该房间
     */
    public int partRoom(long roomId, long userId) {
        User user = userManager.getLoggedInUser(userId);
        Room room = getJoinedRoom(userId);
        // 未加入该房间
        if (room == null || roomId != room.getId()) {
            return 2;
        }

        return partRoom(room, user);
    }


    public int partRoom(Room room, User user) {
        room.partUser(user);
        userJoinedRoomMap.remove(user.getId());
        userActivityService.exit(user, UserActivity.IN_ROOM);

        // 离开之后，房间内还有用户
        if (room.getUserCount() == 1) {
            User otherUser = room.getOneUser();
            UserActivity otherUserStatus = userActivityService.getCurrentStatus(otherUser);
            // 该用户在房间/游戏中
            if (otherUserStatus == UserActivity.IN_ROOM || otherUserStatus == UserActivity.PLAYING) {
                // 如果是房主离开，转移房主引用
                if (room.getOwner().equals(user)) {
                    room.setOwner(otherUser);
                    room.updateUserReadyState(room.getOwner(), true);
                }
                userActivityService.enter(otherUser, UserActivity.IN_ROOM);
            } else {
                // 不在游戏中则将此用户也从房间移除
                partRoom(room, otherUser);
                // 导致解散房间
                if (room.getStatus() == RoomStatus.DISMISSED) {
                    return 0;
                }
            }
        }

        if (room.getUserCount() == 0) {
            // 如果全部离开了，解散房间
            dismissRoom(room);
        } else {
            userActivityService.broadcast(UserActivity.IN_LOBBY, new LobbyRoomUpdateServerMsg(room));
        }

        // 如果有在线用户，发送离开消息
        RoomUserLeftServerMsg leftMsg = new RoomUserLeftServerMsg();
        leftMsg.setUid(user.getId());
        if (room.getOnlineUserCount() > 0) {
            broadcast(room, leftMsg);
        } else {
            spectatorManager.broadcast(room, leftMsg);
        }
        channelManager.broadcast(room.getChannel(), new InfoMessage(user.getNickname() + " 离开房间"));

        return 0;
    }

    public boolean updateRoomInfo(Long roomId, UpdateRoomParam param) {
        Room room = getRoom(roomId);
        if (StringUtils.isNotBlank(param.getName())) {
            room.setName(param.getName());
        }
        if (StringUtils.isNotBlank(param.getPassword())) {
            room.setPassword(param.getPassword());
        }

        userActivityService.broadcast(UserActivity.IN_LOBBY, new LobbyRoomUpdateServerMsg(room));
        return true;
    }

    public void dismissRoom(Room room) {
        room.setStatus(RoomStatus.DISMISSED);
        channelManager.removeChannel(room.getChannel());
        roomMap.remove(room.getId());
        userActivityService.broadcast(UserActivity.IN_LOBBY, new LobbyRoomRemoveServerMsg(room));
    }

    public void broadcast(Room room, ServerMessage message) {
        broadcast(room, message, null);
    }

    public void broadcast(Room room, ServerMessage message, User exclude) {
        room.getUsers().forEach(user -> {
            if (user.equals(exclude)) {
                return;
            }
            wsMessageService.send(message, user);
        });
        spectatorManager.broadcast(room, message);
    }

    private static long nextRoomId = 1000;
    private long nextRoomId() {
        return ++nextRoomId;
        //return redisTemplate.opsForValue().increment("room:next_id", 1);
    }
}