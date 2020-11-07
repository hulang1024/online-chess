package io.github.hulang1024.chinesechessserver.listener;

import java.util.Optional;
import java.util.stream.Collectors;

import io.github.hulang1024.chinesechessserver.ChineseChessServerEndpoint;
import io.github.hulang1024.chinesechessserver.convert.RoomConvert;
import io.github.hulang1024.chinesechessserver.domain.Player;
import io.github.hulang1024.chinesechessserver.domain.Room;
import io.github.hulang1024.chinesechessserver.message.client.lobby.LobbyEnter;
import io.github.hulang1024.chinesechessserver.message.client.lobby.LobbyExit;
import io.github.hulang1024.chinesechessserver.message.client.lobby.QuickMatch;
import io.github.hulang1024.chinesechessserver.message.client.lobby.SearchRooms;
import io.github.hulang1024.chinesechessserver.message.client.room.RoomJoin;
import io.github.hulang1024.chinesechessserver.message.server.lobby.QuickMatchResult;
import io.github.hulang1024.chinesechessserver.message.server.lobby.SearchRoomsResult;
import io.github.hulang1024.chinesechessserver.message.server.stat.OnlineStatMessage;
import io.github.hulang1024.chinesechessserver.service.LobbyService;
import io.github.hulang1024.chinesechessserver.service.PlayerSessionService;
import io.github.hulang1024.chinesechessserver.service.RoomService;

public class LobbyMessageListener extends MessageListener {
    private LobbyService lobbyService = new LobbyService();
    private RoomService roomService = new RoomService();
    private PlayerSessionService playerSessionService = new PlayerSessionService();

    @Override
    public void init() {
        addMessageHandler(LobbyEnter.class, (lobbyEnter) -> {
            lobbyService.addStayLobbySession(lobbyEnter.getSession());

            OnlineStatMessage statMsg = new OnlineStatMessage();
            statMsg.setOnline(ChineseChessServerEndpoint.connectedSessionCount);
            lobbyService.getAllStayLobbySessions().forEach(session -> {
                send(statMsg, session);
            });
        });
        
        addMessageHandler(LobbyExit.class, (lobbyExit) -> {
            lobbyService.removeStayLobbySession(lobbyExit.getSession());
        });

        addMessageHandler(SearchRooms.class, this::searchRooms);
        addMessageHandler(QuickMatch.class, this::quickMatch);
    }

    private void searchRooms(SearchRooms searchParams) {
        SearchRoomsResult result = new SearchRoomsResult();
        result.setRooms(roomService.search(searchParams).stream()
            .sorted((a, b) -> {
                int ret = a.getPlayerCount() - b.getPlayerCount();
                if (ret == 0) {
                    return b.getCreateAt().compareTo(a.getCreateAt());
                }
                return ret;
            })
            .map(room -> new RoomConvert().toLobbyRoom(room))
            .collect(Collectors.toList()));

        send(result, searchParams.getSession());
    }


    private void quickMatch(QuickMatch quickMatch) {
        QuickMatchResult result = new QuickMatchResult();

        Player player = playerSessionService.getPlayer(quickMatch.getSession());

        if (player.isJoinedAnyRoom()) {
            result.setCode(2);
            send(result, quickMatch.getSession());
            return;
        }

        Optional<Room> roomOpt = roomService.getAllRooms().stream()
            .filter(room -> room.getPlayerCount() < 2).findAny();
        if (roomOpt.isPresent()) {
            // 加入房间
            RoomJoin roomJoin = new RoomJoin();
            roomJoin.setSession(quickMatch.getSession());
            roomJoin.setRoomId(roomOpt.get().getId());
            emit(RoomJoin.class, roomJoin);
        } else {
            // 匹配失败
            result.setCode(3);
            send(result, quickMatch.getSession());
        }
    }
}
