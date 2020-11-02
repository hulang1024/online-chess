package io.github.hulang1024.chinesechessserver.listener;

import io.github.hulang1024.chinesechessserver.convert.PlayerConvert;
import io.github.hulang1024.chinesechessserver.convert.RoomConvert;
import io.github.hulang1024.chinesechessserver.domain.ChessPlayRound;
import io.github.hulang1024.chinesechessserver.domain.Player;
import io.github.hulang1024.chinesechessserver.domain.Room;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessEat;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessMove;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessPlayReady;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessEatResult;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessMoveResult;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessPlayReadyResult;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessPlayRoundStart;
import io.github.hulang1024.chinesechessserver.message.server.lobby.LobbyRoomUpdate;
import io.github.hulang1024.chinesechessserver.service.LobbyService;
import io.github.hulang1024.chinesechessserver.service.PlayerSessionService;

public class ChessPlayMessageListener extends MessageListener {
    private PlayerSessionService playerSessionService = new PlayerSessionService();
    private LobbyService lobbyService = new LobbyService();

    @Override
    public void init() {
        addMessageHandler(ChessPlayReady.class, this::ready);
        addMessageHandler(ChessMove.class, this::moveChess);
        addMessageHandler(ChessEat.class, this::eatChess);

    }

    public void ready(ChessPlayReady ready) {
        Player playerToReady = playerSessionService.getPlayer(ready.getSession());
        Room room = playerToReady.getJoinedRoom();

        playerToReady.setReadyed(!playerToReady.isReadyed());

        ChessPlayReadyResult result = new ChessPlayReadyResult();
        result.setCode(0);
        result.setPlayer(new PlayerConvert().toRoomPlayerInfo(playerToReady));

        // 广播给已在此房间的玩家
        room.getPlayers().forEach((player) -> {
            send(result, player.getSession());
        });

        // 大厅广播房间更新
        LobbyRoomUpdate roomUpdate = new LobbyRoomUpdate();
        roomUpdate.setRoom(new RoomConvert().toLobbyRoom(room));
        lobbyService.getAllStayLobbySessions().forEach(lsession -> {
            send(roomUpdate, lsession);
        });

        // 如果全部准备好，开始游戏
        boolean isAllReadyed = room.getPlayerCount() == 2
            && room.getPlayers().stream().allMatch(player -> player.isReadyed());
        if (isAllReadyed) {
            startRound(room);
        }
    }

    private void moveChess(ChessMove chessMove) {
        Player playerToReady = playerSessionService.getPlayer(chessMove.getSession());
        Room room = playerToReady.getJoinedRoom();

        ChessMoveResult result = new ChessMoveResult();
        result.setHost(chessMove.getHost());
        result.setSourceChessRow(chessMove.getSourceChessRow());
        result.setSourceChessCol(chessMove.getSourceChessCol());
        result.setTargetChessRow(chessMove.getTargetChessRow());
        result.setTargetChessCol(chessMove.getTargetChessCol());

        // 广播给已在此房间的玩家
        room.getPlayers().forEach((player) -> {
            send(result, player.getSession());
        });
    }

    private void eatChess(ChessEat chessEat) {
        Player playerToReady = playerSessionService.getPlayer(chessEat.getSession());
        Room room = playerToReady.getJoinedRoom();

        ChessEatResult result = new ChessEatResult();
        result.setHost(chessEat.getHost());
        result.setSourceChessRow(chessEat.getSourceChessRow());
        result.setSourceChessCol(chessEat.getSourceChessCol());
        result.setTargetChessRow(chessEat.getTargetChessRow());
        result.setTargetChessCol(chessEat.getTargetChessCol());

        // 广播给已在此房间的玩家
        room.getPlayers().forEach((player) -> {
            send(result, player.getSession());
        });
    }

    private void startRound(Room room) {
        // 创建棋局
        ChessPlayRound round;
        if (room.getRound() == null) {
            // 第一局红方默认是房主
            Player other = room.getPlayers().stream()
                .filter(player -> player != room.getOwner()).findFirst().get();
            round = new ChessPlayRound(room.getOwner(), other);
            room.setRound(round);
        } else {
            // 后面局交换先手
            round = room.getRound();
            round.swapRedAndBlack();
        }

        ChessPlayRoundStart redStart = new ChessPlayRoundStart();
        redStart.setHost(1);
        send(redStart, round.getRedPlayer().getSession());

        ChessPlayRoundStart blackStart = new ChessPlayRoundStart();
        blackStart.setHost(2);
        send(blackStart, round.getBlackPlayer().getSession());
    }
}
