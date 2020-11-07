package io.github.hulang1024.chinesechessserver.listener;

import java.util.List;
import java.util.stream.Collectors;

import org.yeauty.pojo.Session;

import io.github.hulang1024.chinesechessserver.ChineseChessServerEndpoint;
import io.github.hulang1024.chinesechessserver.ClientEventManager;
import io.github.hulang1024.chinesechessserver.convert.PlayerConvert;
import io.github.hulang1024.chinesechessserver.convert.RoomConvert;
import io.github.hulang1024.chinesechessserver.domain.Player;
import io.github.hulang1024.chinesechessserver.domain.Room;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomCreate;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomLeave;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomJoin;
import io.github.hulang1024.chinesechessserver.message.server.LoginResult;
import io.github.hulang1024.chinesechessserver.message.server.lobby.LobbyRoomRemove;
import io.github.hulang1024.chinesechessserver.message.server.lobby.LobbyRoomUpdate;
import io.github.hulang1024.chinesechessserver.message.server.lobby.RoomCreateResult;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomJoinResult;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomLeaveResult;
import io.github.hulang1024.chinesechessserver.message.server.stat.OnlineStatMessage;
import io.github.hulang1024.chinesechessserver.service.LobbyService;
import io.github.hulang1024.chinesechessserver.service.PlayerSessionService;
import io.github.hulang1024.chinesechessserver.service.RoomService;

public class RoomMessageListener extends MessageListener {
    private RoomService roomService = new RoomService();
    private PlayerSessionService playerSessionService = new PlayerSessionService();
    private LobbyService lobbyService = new LobbyService();

    @Override
    public void init() {
        addMessageHandler(RoomCreate.class, this::createRoom);
        addMessageHandler(RoomJoin.class, this::joinRoom);
        addMessageHandler(RoomLeave.class, this::leaveRoom);

        ClientEventManager.addSessionCloseEventHandler(session -> {
            Player player = playerSessionService.getPlayer(session);
            if (player != null && player.isJoinedAnyRoom()) {
                RoomLeave leave = new RoomLeave();
                leave.setSession(session);
                leaveRoom(leave);
            }

            lobbyService.removeStayLobbySession(session);

            sendUpdateStat();
        });

        ClientEventManager.addSessionOpenEventHandler(session -> {
            // 这里做个"登录"的逻辑，暂时支持游客登录
            playerSessionService.login(session);
            LoginResult loginResult = new LoginResult();
            loginResult.setCode(0);
            loginResult.setUser(new PlayerConvert().toRoomPlayerInfo(
                playerSessionService.getPlayer(session)));
            send(loginResult, session);
            sendUpdateStat();
        });
    }

    private void sendUpdateStat() {
        OnlineStatMessage statMsg = new OnlineStatMessage();
        statMsg.setOnline(ChineseChessServerEndpoint.connectedSessionCount);
        
        lobbyService.getAllStayLobbySessions().forEach(session -> {
            send(statMsg, session);
        });
    }

    private void createRoom(RoomCreate create) {
        RoomCreateResult result = new RoomCreateResult();

        Player player = playerSessionService.getPlayer(create.getSession());
        // 判断该玩家是否已经加入了任何房间
        if (player.isJoinedAnyRoom()) {
            result.setCode(2);
            send(result, create.getSession());
            return;
        }
        
        // 初始就准备状态
        player.setReadyed(true);

        // 创建房间
        Room room = roomService.create(create);
        // 设置房主
        room.setOwner(player);
        // 创建成功结果
        result.setRoom(new RoomConvert().toLobbyRoom(room));
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
        
        Player playerToJoin = playerSessionService.getPlayer(session);
        
        result.setPlayer(new PlayerConvert().toRoomPlayerInfo(playerToJoin));
        
        result.setRoom(new RoomConvert().toLobbyRoom(room));

        // 判断该玩家是否已经加入了任何房间
        if (playerToJoin.isJoinedAnyRoom()) {
            result.setCode(playerToJoin.getJoinedRoom().getId() == room.getId() ? 4 : 5);
            send(result, session);
            return;
        }

        // 限定2个人
        if (room.getPlayerCount() == 2) {
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
        if (room.getPlayerCount() == 0) {
            playerToJoin.setChessHost(1);
        } else {
            Player otherPlayer = room.getPlayers().get(0);
            playerToJoin.setChessHost(otherPlayer.getChessHost() == 1 ? 2 : 1);
        }

        playerToJoin.joinRoom(room);

        // 加入之后要重新设置房间状态
        result.setRoom(new RoomConvert().toLobbyRoom(room));
        
        // 广播给已在此房间的玩家
        room.getPlayers().forEach(player -> {
            send(result, player.getSession());
        });

        // 大厅广播房间更新
        LobbyRoomUpdate roomUpdate = new LobbyRoomUpdate();
        roomUpdate.setRoom(result.getRoom());
        lobbyService.getAllStayLobbySessions().forEach(lsession -> {
            if (playerToJoin.getSession() != lsession) {
                send(roomUpdate, lsession);
            }
        });
    }

    public void leaveRoom(RoomLeave leave) {
        Session session = leave.getSession();
        Player playerToLeave = playerSessionService.getPlayer(session);
        RoomLeaveResult result = new RoomLeaveResult();
        // 未加入该房间
        if (!playerToLeave.isJoinedAnyRoom()) {
            result.setCode(2);
            send(result, session);
            return;
        }

        Room room = playerToLeave.getJoinedRoom();

        List<Session> playerSessions = room.getPlayers().stream()
            .map(Player::getSession)
            .collect(Collectors.toList());

        playerToLeave.leaveRoom();
        
        // 对局状态置为空
        room.setRound(null);

        // 如果全部离开了
        if (room.getPlayerCount() == 0) {
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
            Player player = room.getPlayers().get(0);
            room.setOwner(player);
            // 反转棋方
            player.setChessHost(player.getChessHost() == 1 ? 2 : 1);

            // 大厅广播房间更新（玩家少一个）
            LobbyRoomUpdate roomUpdate = new LobbyRoomUpdate();
            roomUpdate.setRoom(new RoomConvert().toLobbyRoom(room));
            lobbyService.getAllStayLobbySessions().forEach(lsession -> {
                send(roomUpdate, lsession);
            });
        }

        result.setPlayer(new PlayerConvert().toRoomPlayerInfo(playerToLeave));

        // 广播给已在此房间的玩家
        playerSessions.forEach(playerSession -> {
            send(result, playerSession);
        });
    }

}