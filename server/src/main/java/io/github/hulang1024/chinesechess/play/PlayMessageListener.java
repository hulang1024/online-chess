package io.github.hulang1024.chinesechess.play;

import io.github.hulang1024.chinesechess.message.AbstractMessageListener;
import io.github.hulang1024.chinesechess.play.rule.ChessHost;
import io.github.hulang1024.chinesechess.play.rule.ChessboardState;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.message.server.play.ChessMoveResult;
import io.github.hulang1024.chinesechess.message.server.play.ChessPickServerMsg;
import io.github.hulang1024.chinesechess.message.server.play.ReadyServerMsg;
import io.github.hulang1024.chinesechess.message.server.play.PlayRoundStart;
import io.github.hulang1024.chinesechess.message.server.play.PlayConfirmServerMsg;
import io.github.hulang1024.chinesechess.message.server.play.PlayConfirmResponseServerMsg;
import io.github.hulang1024.chinesechess.play.message.ChessMoveMsg;
import io.github.hulang1024.chinesechess.play.message.ChessPickMsg;
import io.github.hulang1024.chinesechess.play.message.ConfirmRequestMsg;
import io.github.hulang1024.chinesechess.play.message.ConfirmResponseMsg;
import io.github.hulang1024.chinesechess.play.message.ConfirmRequestType;
import io.github.hulang1024.chinesechess.play.message.ReadyMsg;
import io.github.hulang1024.chinesechess.play.message.GameOverMsg;
import io.github.hulang1024.chinesechess.message.server.lobby.LobbyRoomUpdateServerMsg;
import io.github.hulang1024.chinesechess.message.server.spectator.SpectatorPlayRoundStartServerMsg;
import io.github.hulang1024.chinesechess.room.LobbyService;
import io.github.hulang1024.chinesechess.user.OnlineUserManager;
import io.github.hulang1024.chinesechess.user.User;
import org.springframework.stereotype.Component;

@Component
public class PlayMessageListener extends AbstractMessageListener {
    private LobbyService lobbyService = new LobbyService();

    @Override
    public void init() {
        addMessageHandler(ReadyMsg.class, this::ready);
        addMessageHandler(ChessPickMsg.class, this::pickChess);
        addMessageHandler(ChessMoveMsg.class, this::moveChess);
        addMessageHandler(GameOverMsg.class, this::onRoundOver);
        addMessageHandler(ConfirmRequestMsg.class, this::onConfirmRequest);
        addMessageHandler(ConfirmResponseMsg.class, this::onConfirmResponse);
    }

    public void ready(ReadyMsg readyMsg) {
        User user = OnlineUserManager.getUser(readyMsg.getSession());
        Room room = user.getJoinedRoom();
        if (room == null) {
            return;
        }

        user.setReadied(readyMsg.getReadyed() != null
            ? readyMsg.getReadyed()
            : !user.isReadied());

        ReadyServerMsg readyServerMsg = new ReadyServerMsg();
        readyServerMsg.setCode(0);
        readyServerMsg.setUid(user.getId());
        readyServerMsg.setReadied(user.isReadied());

        room.broadcast(readyServerMsg);


        lobbyService.broadcast(new LobbyRoomUpdateServerMsg(room), user);

        // 如果全部准备好，开始游戏
        boolean isAllReadied = room.getUserCount() == 2
            && room.getUsers().stream().allMatch(u -> u.isReadied());
        if (isAllReadied) {
            startRound(room);
        }
    }

    private void pickChess(ChessPickMsg chessPickMsg) {
        User user = OnlineUserManager.getUser(chessPickMsg.getSession());
        Room room = user.getJoinedRoom();

        ChessPickServerMsg chessPickServerMsg = new ChessPickServerMsg();
        chessPickServerMsg.setChessHost(user.getChessHost().code());
        chessPickServerMsg.setPos(chessPickMsg.getPos());
        chessPickServerMsg.setPickup(chessPickMsg.isPickup());

        room.broadcast(chessPickServerMsg, user);
    }

    private void moveChess(ChessMoveMsg chessMoveMsg) {
        User user = OnlineUserManager.getUser(chessMoveMsg.getSession());
        Room room = user.getJoinedRoom();

        ChessboardState chessboardState = room.getRound().getChessboardState();

        // 记录动作
        ChessAction action = new ChessAction();
        action.setChessHost(user.getChessHost());
        action.setChessType(chessboardState.chessAt(chessMoveMsg.getFromPos(), action.getChessHost()).type);
        action.setFromPos(chessMoveMsg.getFromPos());
        action.setToPos(chessMoveMsg.getToPos());
        if (chessMoveMsg.getMoveType() == 2) {
            action.setEatenChess(chessboardState.chessAt(chessMoveMsg.getToPos(), action.getChessHost()));
        }
        room.getRound().getActionStack().push(action);

        chessboardState.moveChess(
            chessMoveMsg.getFromPos(), chessMoveMsg.getToPos(), user.getChessHost());
        
        room.getRound().turnActiveChessHost();

        ChessMoveResult result = new ChessMoveResult();
        result.setChessHost(user.getChessHost().code());
        result.setMoveType(chessMoveMsg.getMoveType());
        result.setFromPos(chessMoveMsg.getFromPos());
        result.setToPos(chessMoveMsg.getToPos());

        room.broadcast(result);
    }

    private void onConfirmRequest(ConfirmRequestMsg confirmRequestMsg) {
        User user = OnlineUserManager.getUser(confirmRequestMsg.getSession());
        Room room = user.getJoinedRoom();

        PlayConfirmServerMsg result = new PlayConfirmServerMsg();
        result.setReqType(confirmRequestMsg.getReqType());
        result.setChessHost(user.getChessHost().code());

        room.broadcast(result);
    }

    private void onConfirmResponse(ConfirmResponseMsg confirmResponseMsg) {
        User user = OnlineUserManager.getUser(confirmResponseMsg.getSession());
        Room room = user.getJoinedRoom();

        PlayConfirmResponseServerMsg result = new PlayConfirmResponseServerMsg();
        result.setReqType(confirmResponseMsg.getReqType());
        result.setChessHost(user.getChessHost().code());
        result.setOk(confirmResponseMsg.isOk());

        if (confirmResponseMsg.isOk()) {
            if (confirmResponseMsg.getReqType() == ConfirmRequestType.WHITE_FLAG.code()) {
                //todo something
            } else if (confirmResponseMsg.getReqType() == ConfirmRequestType.DRAW.code()) {
                //todo something
            } else if (confirmResponseMsg.getReqType() == ConfirmRequestType.WITHDRAW.code()) {
                withdraw(room);
                room.getRound().turnActiveChessHost();
            }
        }

        room.broadcast(result);
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
        User redChessUser = null;
        User blackChessUser = null;
        for (User user : room.getUsers()) {
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

        PlayRoundStart redStart = new PlayRoundStart();
        redStart.setChessHost(1);
        send(redStart, round.getRedChessUser().getSession());

        PlayRoundStart blackStart = new PlayRoundStart();
        blackStart.setChessHost(2);
        send(blackStart, round.getBlackChessUser().getSession());

        // 观众
        SpectatorPlayRoundStartServerMsg roundStart = new SpectatorPlayRoundStartServerMsg();
        roundStart.setRedChessUid(round.getRedChessUser().getId());
        roundStart.setBlackChessUid(round.getBlackChessUser().getId());
        room.getSpectators().forEach(user -> {
            send(roundStart, user.getSession());
        });
    }

    private void onRoundOver(GameOverMsg msg) {
        User user = OnlineUserManager.getUser(msg.getSession());
        Room room = user.getJoinedRoom();

        lobbyService.broadcast(new LobbyRoomUpdateServerMsg(room), user);
    }
}
