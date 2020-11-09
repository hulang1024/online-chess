package io.github.hulang1024.chinesechessserver.listener;

import io.github.hulang1024.chinesechessserver.convert.RoomConvert;
import io.github.hulang1024.chinesechessserver.domain.RoundGame;
import io.github.hulang1024.chinesechessserver.domain.SessionUser;
import io.github.hulang1024.chinesechessserver.domain.chinesechess.rule.ChessHost;
import io.github.hulang1024.chinesechessserver.domain.Room;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessMoveResult;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessPickResult;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessPlayReadyResult;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessPlayRoundStart;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessMove;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessPick;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.PlayReady;
import io.github.hulang1024.chinesechessserver.message.server.lobby.LobbyRoomUpdate;
import io.github.hulang1024.chinesechessserver.message.server.spectator.SpectatorChessPlayRoundStart;
import io.github.hulang1024.chinesechessserver.service.LobbyService;
import io.github.hulang1024.chinesechessserver.service.UserSessionService;

public class ChessPlayMessageListener extends MessageListener {
    private UserSessionService userSessionService = new UserSessionService();
    private LobbyService lobbyService = new LobbyService();

    @Override
    public void init() {
        addMessageHandler(PlayReady.class, this::ready);
        addMessageHandler(ChessPick.class, this::pickChess);
        addMessageHandler(ChessMove.class, this::moveChess);
    }

    public void ready(PlayReady ready) {
        SessionUser userToReady = userSessionService.getUserBySession(ready.getSession());
        Room room = userToReady.getJoinedRoom();

        userToReady.setReadyed(!userToReady.isReadyed());

        ChessPlayReadyResult result = new ChessPlayReadyResult();
        result.setCode(0);
        result.setUid(userToReady.getUser().getId());
        result.setReadyed(userToReady.isReadyed());

        // 广播给已在此房间的参与者
        room.getUsers().forEach(user -> {
            send(result, user.getSession());
        });
        // 观众
        room.getSpectators().forEach(user -> {
            send(result, user.getSession());
        });

        // 大厅广播房间更新
        LobbyRoomUpdate roomUpdate = new LobbyRoomUpdate();
        roomUpdate.setRoom(new RoomConvert().toRoomInfo(room));
        lobbyService.getAllStayLobbySessions().forEach(lsession -> {
            send(roomUpdate, lsession);
        });

        // 如果全部准备好，开始游戏
        boolean isAllReadyed = room.getUserCount() == 2
            && room.getUsers().stream().allMatch(user -> user.isReadyed());
        if (isAllReadyed) {
            startRound(room);
        }
    }

    private void pickChess(ChessPick chessPick) {
        SessionUser actionUser = userSessionService.getUserBySession(chessPick.getSession());
        Room room = actionUser.getJoinedRoom();

        ChessPickResult result = new ChessPickResult();
        result.setChessHost(actionUser.getChessHost().code());
        result.setPos(chessPick.getPos());
        result.setPickup(chessPick.isPickup());
        
        // 广播给已在此房间的其它用户
        room.getUsers().forEach((user) -> {
            if (user.getSession() != actionUser.getSession()) {
                send(result, user.getSession());
            }
        });
        // 观众
        room.getSpectators().forEach(user -> {
            send(result, user.getSession());
        });
    }

    private void moveChess(ChessMove chessMove) {
        SessionUser actionUser = userSessionService.getUserBySession(chessMove.getSession());
        Room room = actionUser.getJoinedRoom();

        ChessMoveResult result = new ChessMoveResult();
        result.setChessHost(actionUser.getChessHost().code());
        result.setMoveType(chessMove.getMoveType());
        result.setFromPos(chessMove.getFromPos());
        result.setToPos(chessMove.getToPos());
        
        if (chessMove.getMoveType() == 2) {
            room.getRound().getChessboardState().setChess(
                chessMove.getFromPos(), null, actionUser.getChessHost());
        }
        room.getRound().getChessboardState().moveChess(
            chessMove.getFromPos(), chessMove.getToPos(), actionUser.getChessHost());
        
        room.getRound().turnActiveChessHost();

        // 广播给已在此房间的参与者
        room.getUsers().forEach((user) -> {
            send(result, user.getSession());
        });
        // 观众
        room.getSpectators().forEach(user -> {
            send(result, user.getSession());
        });
    }

    private void startRound(Room room) {
        // 创建棋局
        RoundGame round;
        if (room.getRound() == null) {
            SessionUser redChessUser = null;
            SessionUser blackChessUser = null;
            for (SessionUser user : room.getUsers()) {
                if (user.getChessHost() == ChessHost.RED) {
                    redChessUser = user;
                } else {
                    blackChessUser = user;
                }
            }
            round = new RoundGame(redChessUser, blackChessUser);
            room.setRound(round);
            
        } else {
            // 后面局交换先手
            round = room.getRound();
            round.swapRedAndBlack();
        }

        ChessPlayRoundStart redStart = new ChessPlayRoundStart();
        redStart.setChessHost(1);
        send(redStart, round.getRedChessUser().getSession());

        ChessPlayRoundStart blackStart = new ChessPlayRoundStart();
        blackStart.setChessHost(2);
        send(blackStart, round.getBlackChessUser().getSession());

        // 观众
        SpectatorChessPlayRoundStart roundStart = new SpectatorChessPlayRoundStart();
        roundStart.setRedChessUid(round.getRedChessUser().getId());
        roundStart.setBlackChessUid(round.getBlackChessUser().getId());
        room.getSpectators().forEach(user -> {
            send(roundStart, user.getSession());
        });
    }
}
