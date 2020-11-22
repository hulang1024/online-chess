package io.github.hulang1024.chinesechess.spectator;

import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.chat.InfoMessage;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserManager;
import io.github.hulang1024.chinesechess.user.UserSessionManager;
import io.github.hulang1024.chinesechess.websocket.message.MessageUtils;
import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
import io.github.hulang1024.chinesechess.websocket.message.server.spectator.SpectatorJoinServerMsg;
import io.github.hulang1024.chinesechess.websocket.message.server.spectator.SpectatorLeaveServerMsg;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SpectatorManager {
    private static Map<Long, Room> spectatorRoomMap = new ConcurrentHashMap<>();

    @Autowired
    private UserManager userManager;
    @Autowired
    private RoomManager roomManager;
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private UserSessionManager userSessionManager;

    public Room getSpectatingRoom(User user) {
        return spectatorRoomMap.get(user.getId());
    }

    public List<User> getSpectators(Room room) {
        return room.getSpectators();
    }

    public SpectateResponse spectate(long userId, SpectateParam param) {
        SpectateResponse response = new SpectateResponse();

        User user = userManager.getLoggedInUser(userId);
        if (user == null) {
            response.setCode(1);
            return response;
        }

        Room room = roomManager.getRoom(param.getRoomId());
        if (room == null) {
            response.setCode(2);
            return response;
        }

        if (room.getUserCount() < 2) {
            response.setCode(3);
            return response;
        }

        room.getSpectators().add(user);
        room.getChannel().joinUser(user);

        spectatorRoomMap.put(user.getId(), room);

        response.setStates(room.getGame().buildGamePlayStatesResponse());

        // 发送给房间玩家用户观众信息
        SpectatorJoinServerMsg joinMsg = new SpectatorJoinServerMsg();
        joinMsg.setUser(user);
        joinMsg.setSpectatorCount(room.getSpectators().size());
        roomManager.broadcast(room, joinMsg, user);

        // 玩家可能都离线/掉线
        if (room.getOnlineUserCount() > 0) {
            channelManager.broadcast(room.getChannel(),
                new InfoMessage(user.getNickname() + " 加入观看"), user);
        }

        return response;
    }

    public void leaveRoom(long userId) {
        User user = userManager.getLoggedInUser(userId);
        Room room = spectatorRoomMap.get(user.getId());
        leaveRoom(user, room);
    }

    public void leaveRoom(User spectator, Room room) {
        room.getSpectators().remove(spectator);
        room.getChannel().removeUser(spectator);
        spectatorRoomMap.remove(spectator.getId());

        SpectatorLeaveServerMsg leaveMsg = new SpectatorLeaveServerMsg();
        leaveMsg.setUid(spectator.getId());
        leaveMsg.setSpectatorCount(room.getSpectators().size());
        roomManager.broadcast(room, leaveMsg);

        channelManager.broadcast(room.getChannel(),
            new InfoMessage(spectator.getNickname() + " 离开观看"));
    }

    public void broadcast(Room room, ServerMessage message) {
        room.getSpectators().forEach(user -> {
            MessageUtils.send(message, userSessionManager.getSession(user));
        });
    }
}
