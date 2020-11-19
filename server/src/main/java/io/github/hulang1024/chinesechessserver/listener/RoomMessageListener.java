package io.github.hulang1024.chinesechessserver.listener;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

import io.github.hulang1024.chinesechessserver.convert.UserConvert;
import io.github.hulang1024.chinesechessserver.convert.RoomConvert;
import io.github.hulang1024.chinesechessserver.service.SessionUser;
import io.github.hulang1024.chinesechessserver.play.rule.ChessHost;
import io.github.hulang1024.chinesechessserver.room.Room;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomCreate;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomJoin;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomLeave;
import io.github.hulang1024.chinesechessserver.message.server.lobby.LobbyRoomRemove;
import io.github.hulang1024.chinesechessserver.message.server.lobby.LobbyRoomUpdate;
import io.github.hulang1024.chinesechessserver.message.server.lobby.RoomCreateResult;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomJoinResult;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomLeaveResult;
import io.github.hulang1024.chinesechessserver.service.LobbyService;
import io.github.hulang1024.chinesechessserver.service.UserSessionService;
import io.github.hulang1024.chinesechessserver.room.RoomService;

@Component
public class RoomMessageListener extends MessageListener {
    private RoomService roomService = new RoomService();
    private UserSessionService userSessionService = new UserSessionService();
    private LobbyService lobbyService = new LobbyService();

    @Override
    public void init() {
        addMessageHandler(RoomCreate.class, this::createRoom);
        addMessageHandler(RoomJoin.class, this::joinRoom);
        addMessageHandler(RoomLeave.class, this::leaveRoom);
    }

    private void createRoom(RoomCreate create) {
        RoomCreateResult result = new RoomCreateResult();

        SessionUser user = userSessionService.getUserBySession(create.getSession());
        // 判断该用户是否已经加入了任何房间
        if (user.isJoinedAnyRoom()) {
            result.setCode(2);
            send(result, create.getSession());
            return;
        }
        
        // 初始就准备状态
        user.setReadyed(true);

        // 创建房间
        Room room = roomService.create(create);
        // 设置房主
        room.setOwner(user);
        // 创建成功结果
        result.setRoom(new RoomConvert().toRoomInfo(room));
        // 给创建者发送结果
        send(result, create.getSession());
        // 大厅广播房间增加
        lobbyService.getAllStayLobbySessions().forEach(session -> {
            // 排除创建者session
            if (session != create.getSession()) {
                send(result, session);
            }
        });

        // 创建完成后立即加入该房间
        RoomJoin roomJoin = new RoomJoin();
        roomJoin.setSession(create.getSession());
        roomJoin.setRoomId(room.getId());
        roomJoin.setPassword(room.getPassword());
        joinRoom(roomJoin);
    }

    public void joinRoom(RoomJoin roomJoin) {
        RoomJoinResult result = new RoomJoinResult();
        Session session = roomJoin.getSession();

        Room room = roomService.getById(roomJoin.getRoomId());
        // 房间不存在
        if (room == null) {
            result.setCode(2);
            send(result, session);
            return;
        }
        
        SessionUser userToJoin = userSessionService.getUserBySession(session);
                
        result.setRoom(new RoomConvert().toRoomInfo(room));

        // 判断该用户是否已经加入了任何房间
        if (userToJoin.isJoinedAnyRoom()) {
            result.setCode(userToJoin.getJoinedRoom().getId() == room.getId() ? 4 : 5);
            send(result, session);
            return;
        }

        // 限定2个人
        if (room.getUserCount() == 2) {
            result.setCode(3);
            send(result, session);
            return;
        }

        // 验证密码，如果有密码
        if (room.isLocked()) {
            if (!room.getPassword().equals(roomJoin.getPassword())) {
                result.setCode(6);
                send(result, session);
                return;
            }
        }

        // 设置棋方
        if (room.getUserCount() == 0) {
            userToJoin.setChessHost(ChessHost.RED);
        } else {
            SessionUser otherUser = room.getUsers1().get(0);
            userToJoin.setChessHost(otherUser.getChessHost().reverse()); 
        }

        userToJoin.joinRoom(room);

        // 加入之后要重新设置房间状态
        result.setRoom(new RoomConvert().toRoomInfo(room));
        result.setUser(new UserConvert().toRoomUserInfo(userToJoin));
        
        // 广播给已在此房间的参与者
        room.getUsers1().forEach(user -> {
            send(result, user.getSession());
        });

        // 观众
        room.getSpectators().forEach(user -> {
            send(result, user.getSession());
        });

        // 大厅广播房间更新
        LobbyRoomUpdate roomUpdate = new LobbyRoomUpdate();
        roomUpdate.setRoom(result.getRoom());
        lobbyService.getAllStayLobbySessions().forEach(lsession -> {
            if (userToJoin.getSession() != lsession) {
                send(roomUpdate, lsession);
            }
        });
    }

    public void leaveRoom(RoomLeave leave) {
        Session session = leave.getSession();
        SessionUser userToLeave = userSessionService.getUserBySession(session);
        RoomLeaveResult result = new RoomLeaveResult();
        // 未加入该房间
        if (!userToLeave.isJoinedAnyRoom()) {
            result.setCode(2);
            send(result, session);
            return;
        }

        Room room = userToLeave.getJoinedRoom();

        List<Session> userSessions = room.getUsers1().stream()
            .map(SessionUser::getSession)
            .collect(Collectors.toList());

        userToLeave.leaveRoom();
        
        // 对局状态置为空
        room.setRound(null);

        // 如果全部离开了
        if (room.getUserCount() == 0) {
            // 删除房间
            roomService.remove(room);

            // 大厅广播房间移除
            LobbyRoomRemove roomRemove = new LobbyRoomRemove();
            roomRemove.setRoomId(room.getId());
            lobbyService.getAllStayLobbySessions().forEach(lsession -> {
                send(roomRemove, lsession);
            });
        } else {
            // 房主变成留下的人
            SessionUser user = room.getUsers1().get(0);
            room.setOwner(user);
            user.setChessHost(user.getChessHost().reverse());

            // 大厅广播房间更新（用户少一个）
            LobbyRoomUpdate roomUpdate = new LobbyRoomUpdate();
            roomUpdate.setRoom(new RoomConvert().toRoomInfo(room));
            lobbyService.getAllStayLobbySessions().forEach(lsession -> {
                send(roomUpdate, lsession);
            });
        }

        result.setUser(new UserConvert().toRoomUserInfo(userToLeave));

        // 广播给已在此房间的参与者
        userSessions.forEach(s -> {
            send(result, s);
        });

        // 观众
        room.getSpectators().forEach(user -> {
            send(result, user.getSession());
        });
    }

}