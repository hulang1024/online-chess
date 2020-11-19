package io.github.hulang1024.chinesechessserver.listener;

import io.github.hulang1024.chinesechessserver.convert.RoomConvert;
import io.github.hulang1024.chinesechessserver.play.GamePlay;
import io.github.hulang1024.chinesechessserver.service.SessionUser;
import io.github.hulang1024.chinesechessserver.play.ChessAction;
import io.github.hulang1024.chinesechessserver.play.rule.ChessHost;
import io.github.hulang1024.chinesechessserver.play.rule.ChessboardState;
import io.github.hulang1024.chinesechessserver.room.Room;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessMoveResult;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessPickResult;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessPlayReadyResult;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessPlayRoundStart;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessPlayConfirmRequestResult;
import io.github.hulang1024.chinesechessserver.message.server.chessplay.ChessPlayConfirmResponseResult;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessMove;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessPick;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessPlayConfirmRequest;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessPlayConfirmResponse;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ConfirmRequestType;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.PlayReady;
import io.github.hulang1024.chinesechessserver.message.client.chessplay.ChessPlayRoundOver;
import io.github.hulang1024.chinesechessserver.message.server.lobby.LobbyRoomUpdate;
import io.github.hulang1024.chinesechessserver.message.server.spectator.SpectatorChessPlayRoundStart;
import io.github.hulang1024.chinesechessserver.service.LobbyService;
import io.github.hulang1024.chinesechessserver.service.UserSessionService;
import org.springframework.stereotype.Component;

@Component
public class ChessPlayMessageListener extends MessageListener {
    private UserSessionService userSessionService = new UserSessionService();
    private LobbyService lobbyService = new LobbyService();

    @Override
    public void init() {
        addMessageHandler(PlayReady.class, this::ready);
        addMessageHandler(ChessPick.class, this::pickChess);
        addMessageHandler(ChessMove.class, this::moveChess);
        addMessageHandler(ChessPlayRoundOver.class, this::onRoundOver);
        addMessageHandler(ChessPlayConfirmRequest.class, this::onConfirmRequest);
        addMessageHandler(ChessPlayConfirmResponse.class, this::onConfirmResponse);
    }

    public void ready(PlayReady ready) {
        SessionUser userToReady = userSessionService.getUserBySession(ready.getSession());
        Room room = userToReady.getJoinedRoom();
        if (room == null) {
            return;
        }

        userToReady.setReadyed(ready.getReadyed() != null
            ? ready.getReadyed()
            : !userToReady.isReadyed());

        ChessPlayReadyResult result = new ChessPlayReadyResult();
        result.setCode(0);
        result.setUid(userToReady.getUser().getId());
        result.setReadyed(userToReady.isReadyed());

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
        roomUpdate.setRoom(new RoomConvert().toRoomInfo(room));
        lobbyService.getAllStayLobbySessions().forEach(lsession -> {
            send(roomUpdate, lsession);
        });

        // 如果全部准备好，开始游戏
        boolean isAllReadyed = room.getUserCount() == 2
            && room.getUsers1().stream().allMatch(user -> user.isReadyed());
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
        room.getUsers1().forEach((user) -> {
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

        ChessboardState chessboardState = room.getRound().getChessboardState();

        // 记录动作
        ChessAction action = new ChessAction();
        action.setChessHost(actionUser.getChessHost());
        action.setChessType(chessboardState.chessAt(chessMove.getFromPos(), action.getChessHost()).type);
        action.setFromPos(chessMove.getFromPos());
        action.setToPos(chessMove.getToPos());
        if (chessMove.getMoveType() == 2) {
            action.setEatenChess(chessboardState.chessAt(chessMove.getToPos(), action.getChessHost()));
        }
        room.getRound().getActionStack().push(action);

        chessboardState.moveChess(
            chessMove.getFromPos(), chessMove.getToPos(), actionUser.getChessHost());
        
        room.getRound().turnActiveChessHost();

        ChessMoveResult result = new ChessMoveResult();
        result.setChessHost(actionUser.getChessHost().code());
        result.setMoveType(chessMove.getMoveType());
        result.setFromPos(chessMove.getFromPos());
        result.setToPos(chessMove.getToPos());
        
        // 广播给已在此房间的参与者
        room.getUsers1().forEach((user) -> {
            send(result, user.getSession());
        });
        // 观众
        room.getSpectators().forEach(user -> {
            send(result, user.getSession());
        });
    }

    private void onConfirmRequest(ChessPlayConfirmRequest msg) {
        SessionUser requester = userSessionService.getUserBySession(msg.getSession());
        Room room = requester.getJoinedRoom();

        ChessPlayConfirmRequestResult result = new ChessPlayConfirmRequestResult();
        result.setReqType(msg.getReqType());
        result.setChessHost(requester.getChessHost().code());
        room.getUsers1().forEach(user -> {
            send(result, user.getSession());
        });
        room.getSpectators().forEach(user -> {
            send(result, user.getSession());
        });
    }

    private void onConfirmResponse(ChessPlayConfirmResponse msg) {
        SessionUser responser = userSessionService.getUserBySession(msg.getSession());
        Room room = responser.getJoinedRoom();

        ChessPlayConfirmResponseResult result = new ChessPlayConfirmResponseResult();
        result.setReqType(msg.getReqType());
        result.setChessHost(responser.getChessHost().code());
        result.setOk(msg.isOk());

        if (msg.isOk()) {
            if (msg.getReqType() == ConfirmRequestType.WHITE_FLAG.code()) {
                //todo something
            } else if (msg.getReqType() == ConfirmRequestType.DRAW.code()) {
                //todo something
            } else if (msg.getReqType() == ConfirmRequestType.WITHDRAW.code()) {
                withdraw(room);
                room.getRound().turnActiveChessHost();
            }
        }

        room.getUsers1().forEach(user -> {
            send(result, user.getSession());
        });
        room.getSpectators().forEach(user -> {
            send(result, user.getSession());
        });
    }

    private void withdraw(Room room) {
        ChessboardState chessboardState = room.getRound().getChessboardState();
        if (room.getRound().getActionStack().isEmpty()) {
            return;
        }
        ChessAction lastAction = room.getRound().getActionStack().pop();
        chessboardState.moveChess(lastAction.getToPos(), lastAction.getFromPos(), lastAction.getChessHost());
        if (lastAction.getEatenChess() != null) {
            chessboardState.setChess(lastAction.getToPos(), lastAction.getEatenChess(), lastAction.getChessHost());
        }
    }

    private void startRound(Room room) {
        // 创建棋局
        GamePlay round;
        SessionUser redChessUser = null;
        SessionUser blackChessUser = null;
        for (SessionUser user : room.getUsers1()) {
            if (user.getChessHost() == ChessHost.RED) {
                redChessUser = user;
            } else {
                blackChessUser = user;
            }
        }
        if (room.getRound() == null) {
            round = new GamePlay(redChessUser, blackChessUser);
            room.setRound(round);
        } else {
            round = new GamePlay(blackChessUser, redChessUser);
            room.setRound(round);
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

    private void onRoundOver(ChessPlayRoundOver msg) {
        SessionUser user = userSessionService.getUserBySession(msg.getSession());
        user.setReadyed(false);

        // 大厅广播房间更新
        LobbyRoomUpdate roomUpdate = new LobbyRoomUpdate();
        roomUpdate.setRoom(new RoomConvert().toRoomInfo(user.getJoinedRoom()));
        lobbyService.getAllStayLobbySessions().forEach(session -> {
            if (user.getSession() != session) {
                send(roomUpdate, session);
            }
        });
    }
}
