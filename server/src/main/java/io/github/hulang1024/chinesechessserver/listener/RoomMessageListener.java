package io.github.hulang1024.chinesechessserver.listener;

import java.util.List;
import java.util.stream.Collectors;

import org.yeauty.pojo.Session;

import io.github.hulang1024.chinesechessserver.ClientEventManager;
import io.github.hulang1024.chinesechessserver.convert.PlayerConvert;
import io.github.hulang1024.chinesechessserver.domain.Player;
import io.github.hulang1024.chinesechessserver.domain.Room;
import io.github.hulang1024.chinesechessserver.message.client.lobby.SearchRooms;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomCreate;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomLeave;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomJoin;
import io.github.hulang1024.chinesechessserver.message.server.lobby.LobbyRoom;
import io.github.hulang1024.chinesechessserver.message.server.lobby.RoomCreateResult;
import io.github.hulang1024.chinesechessserver.message.server.lobby.SearchRoomsResult;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomJoinResult;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomLeaveResult;
import io.github.hulang1024.chinesechessserver.service.PlayerSessionService;
import io.github.hulang1024.chinesechessserver.service.RoomService;

public class RoomMessageListener extends MessageListener {
    private RoomService roomService = new RoomService();
    private PlayerSessionService playerSessionService = new PlayerSessionService();

    @Override
    public void init() {
        addMessageHandler(SearchRooms.class, this::searchRooms);
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
        });
    }

    private void searchRooms(SearchRooms searchParams) {
        SearchRoomsResult result = new SearchRoomsResult();
        result.setRooms(roomService.search(searchParams).stream()
            .map(room -> {
                LobbyRoom lobbyRoom = new LobbyRoom();
                lobbyRoom.setId(room.getId());
                lobbyRoom.setName(room.getName());
                lobbyRoom.setPlayerCount(room.getPlayerCount());
                lobbyRoom.setPlayers(room.getPlayers().stream()
                    .map(player -> {
                        return new PlayerConvert().toRoomPlayerInfo(player);
                    })
                    .collect(Collectors.toList()));
                return lobbyRoom;
            })
            .collect(Collectors.toList()));

        send(result, searchParams.getSession());

        // 这里做个"登录"的逻辑，暂时支持游客登录
        playerSessionService.login(searchParams.getSession());
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

        // 根据请求创建房间
        Room room = roomService.create(create);
        
        room.setCreator(player);

        // 创建成功结果
        LobbyRoom lobbyRoom = new LobbyRoom();
        lobbyRoom.setId(room.getId());
        lobbyRoom.setName(room.getName());
        lobbyRoom.setPlayerCount(0);
        result.setRoom(lobbyRoom);

        send(result, create.getSession());
        
        // 加入房间
        RoomJoin roomJoin = new RoomJoin();
        roomJoin.setSession(create.getSession());
        roomJoin.setRoomId(room.getId());
        joinRoom(roomJoin);
    }

    public void joinRoom(RoomJoin roomJoin) {
        RoomJoinResult result = new RoomJoinResult();
        Session session = roomJoin.getSession();

        Room room = roomService.getById(roomJoin.getRoomId());

        if (room == null) {
            result.setCode(2);
            send(result, session);
            return;
        }

        // 限定2个人
        if (room.getPlayerCount() == 2) {
            result.setCode(3);
            send(result, session);
            return;
        }

        Player playerToJoin = playerSessionService.getPlayer(session);
        // 判断该玩家是否已经加入了任何房间
        if (playerToJoin.isJoinedAnyRoom()) {
            result.setCode(2);
            send(result, session);
            return;
        }

        playerToJoin.joinRoom(room);

        LobbyRoom roomResult = new LobbyRoom();
        roomResult.setId(room.getId());
        roomResult.setName(room.getName());
        roomResult.setPlayerCount(room.getPlayerCount());
        roomResult.setPlayers(room.getPlayers().stream()
            .map(p -> { return new PlayerConvert().toRoomPlayerInfo(p); })
            .collect(Collectors.toList()));
        result.setRoom(roomResult);
        result.setPlayer(new PlayerConvert().toRoomPlayerInfo(playerToJoin));

        // 广播给已在此房间的玩家
        room.getPlayers().forEach(player -> {
            send(result, player.getSession());
        });
    }

    public void leaveRoom(RoomLeave leave) {
        Session session = leave.getSession();
        Player playerToLeave = playerSessionService.getPlayer(session);
        RoomLeaveResult result = new RoomLeaveResult();

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

        // 如果全部离开了，删除房间
        if (room.getPlayerCount() == 0) {
            roomService.remove(room);
        }

        result.setPlayer(new PlayerConvert().toRoomPlayerInfo(playerToLeave));

        // 广播给已在此房间的玩家
        playerSessions.forEach(playerSession -> {
            send(result, playerSession);
        });
    }

}