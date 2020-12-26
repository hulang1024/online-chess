package io.github.hulang1024.chinesechess.spectator;

import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.chat.ws.ChatUpdatesServerMsg;
import io.github.hulang1024.chinesechess.play.GameState;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.spectator.ws.SpectatorJoinServerMsg;
import io.github.hulang1024.chinesechess.spectator.ws.SpectatorLeftServerMsg;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserManager;
import io.github.hulang1024.chinesechess.user.activity.UserActivity;
import io.github.hulang1024.chinesechess.user.activity.UserActivityService;
import io.github.hulang1024.chinesechess.ws.ServerMessage;
import io.github.hulang1024.chinesechess.ws.WSMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SpectatorManager {
    // 记录用户观看房间
    private static Map<Long, Room> spectatorRoomMap = new ConcurrentHashMap<>();
    // 记录用户观看目标用户（同时观看房间）
    private static Map<Long, Long> spectatorTargetUserMap = new ConcurrentHashMap<>();

    @Autowired
    private UserManager userManager;
    @Autowired
    private RoomManager roomManager;
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private WSMessageService wsMessageService;
    @Autowired
    private UserActivityService userActivityService;

    public Room getSpectatingRoom(User user) {
        return spectatorRoomMap.get(user.getId());
    }

    public List<User> getSpectators(Room room) {
        return room.getSpectators();
    }

    public SpectateResponse spectateRoom(long roomId, long spectatorId) {
        return spectate(null, roomId, spectatorId);
    }

    public SpectateResponse spectateUser(long targetUserId, long spectatorId) {
        User targetUser = userManager.getLoggedInUser(targetUserId);
        if (targetUser == null) {
            return SpectateResponse.fail(2);
        }
        if (targetUserId == spectatorId) {
            return SpectateResponse.fail(6);
        }

        // 目标用户已在旁观（也已是观众），则跟随
        Room spectatingRoom = getSpectatingRoom(targetUser);
        if (spectatingRoom != null) {
            return followOtherSpectator(targetUser.getId(), spectatingRoom, spectatorId);
        }

        return spectate(targetUser, null, spectatorId);
    }

    private SpectateResponse spectate(User targetUser, Long roomId, long spectatorId) {
        User spectator = userManager.getLoggedInUser(spectatorId);
        if (spectator == null) {
            return SpectateResponse.fail(1);
        }

        // 房间不存在或者目标用户是否不在任何游戏房间中
        Room room = targetUser != null ? roomManager.getJoinedRoom(targetUser) : roomManager.getRoom(roomId);
        if (room == null) {
            return SpectateResponse.fail(3);
        }

        Room joinedRoom = roomManager.getJoinedRoom(spectator);
        if (joinedRoom != null) {
            // 早已经在其它房间
            if (joinedRoom.getGame() == null || joinedRoom.getGame().getState() == GameState.READY) {
                // 不在游戏中现在就退出
                roomManager.partRoom(joinedRoom, spectator);
            } else {
                return SpectateResponse.fail(5);
            }
        }

        // 已观看其它房间，退出
        Room prevSpectatingRoom = getSpectatingRoom(spectator);
        if (prevSpectatingRoom != null) {
            leaveRoom(spectator, prevSpectatingRoom);
        }

        room.getSpectators().add(spectator);
        channelManager.joinChannel(room.getChannel(), spectator);
        userActivityService.enter(spectator, UserActivity.SPECTATING);

        ChatUpdatesServerMsg chatUpdatesServerMsg = new ChatUpdatesServerMsg();
        chatUpdatesServerMsg.setChannel(room.getChannel());
        chatUpdatesServerMsg.setRecentMessages(room.getChannel().getMessages());
        wsMessageService.send(chatUpdatesServerMsg, spectator);

        spectatorRoomMap.put(spectator.getId(), room);

        SpectateResponse response = new SpectateResponse(0);
        if (room.getGame() != null) {
            response.setStates(room.getGame().buildGameStatesResponse());
            response.getStates().setRoom(null);
        }
        response.setRoom(room);
        if (targetUser != null) {
            spectatorTargetUserMap.put(spectator.getId(), targetUser.getId());
            response.setTargetUserId(targetUser.getId());
        }

        // 发送给房间玩家用户观众信息
        SpectatorJoinServerMsg joinMsg = new SpectatorJoinServerMsg();
        joinMsg.setUser(spectator);
        joinMsg.setSpectatorCount(room.getSpectators().size());
        roomManager.broadcast(room, joinMsg, spectator);

        return response;
    }

    private SpectateResponse followOtherSpectator(long otherSpectatorId, Room room, long spectatorId) {
        SpectateResponse response;
        Long targetUserId = spectatorTargetUserMap.get(otherSpectatorId);
        if (targetUserId != null) {
            response = spectateUser(targetUserId, spectatorId);
        } else {
            response = spectateRoom(room.getId(), spectatorId);
        }
        response.setFollowedOtherSpectator(true);
        return response;
    }

    public void leaveRoom(long roomId, long userId) {
        User user = userManager.getLoggedInUser(userId);
        Room room = roomManager.getRoom(roomId);
        leaveRoom(user, room);
    }

    public void leaveRoom(User spectator, Room room) {
        room.getSpectators().remove(spectator);
        room.getChannel().removeUser(spectator);
        spectatorRoomMap.remove(spectator.getId());
        spectatorTargetUserMap.remove(spectator.getId());
        userActivityService.exit(spectator, UserActivity.SPECTATING);

        SpectatorLeftServerMsg leftMsg = new SpectatorLeftServerMsg();
        leftMsg.setUid(spectator.getId());
        leftMsg.setSpectatorCount(room.getSpectators().size());
        roomManager.broadcast(room, leftMsg);
    }

    public void broadcast(Room room, ServerMessage message) {
        room.getSpectators().forEach(user -> {
            wsMessageService.send(message, user);
        });
    }
}
