package io.github.hulang1024.chinesechessserver.listener;

import io.github.hulang1024.chinesechessserver.convert.PlayerConvert;
import io.github.hulang1024.chinesechessserver.convert.RoomConvert;
import io.github.hulang1024.chinesechessserver.domain.ChessPlayRound;
import io.github.hulang1024.chinesechessserver.domain.Player;
import io.github.hulang1024.chinesechessserver.domain.Room;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessEat;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessMove;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessPick;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessPlayReady;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessEatResult;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessMoveResult;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessPickResult;
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
        addMessageHandler(ChessPick.class, this::pickChess);
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

    private void pickChess(ChessPick chessPick) {
        Player actionPlayer = playerSessionService.getPlayer(chessPick.getSession());

        ChessPickResult result = new ChessPickResult();
        result.setHost(actionPlayer.getChessHost());
        result.setChessRow(chessPick.getChessRow());
        result.setChessCol(chessPick.getChessCol());
        // 广播给已在此房间的其它玩家
        actionPlayer.getJoinedRoom().getPlayers().forEach((player) -> {
            if (player.getSession() != actionPlayer.getSession()) {
                send(result, player.getSession());
            }
        });
    }

    private void moveChess(ChessMove chessMove) {
        Player actionPlayer = playerSessionService.getPlayer(chessMove.getSession());
        Room room = actionPlayer.getJoinedRoom();

        ChessMoveResult result = new ChessMoveResult();
        result.setHost(actionPlayer.getChessHost());
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
        Player actionPlayer = playerSessionService.getPlayer(chessEat.getSession());
        Room room = actionPlayer.getJoinedRoom();

        ChessEatResult result = new ChessEatResult();
        result.setHost(actionPlayer.getChessHost());
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
            Player redPlayer = null;
            Player blackPlayer = null;
            for (Player player : room.getPlayers()) {
                if (player.getChessHost() == 1) {
                    redPlayer = player;
                } else {
                    blackPlayer = player;
                }
            }
            round = new ChessPlayRound(redPlayer, blackPlayer);
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
