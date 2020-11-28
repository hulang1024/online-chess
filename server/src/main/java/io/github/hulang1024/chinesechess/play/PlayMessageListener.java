package io.github.hulang1024.chinesechess.play;

import io.github.hulang1024.chinesechess.play.ws.*;
import io.github.hulang1024.chinesechess.play.ws.servermsg.*;
import io.github.hulang1024.chinesechess.play.rule.ChessboardState;
import io.github.hulang1024.chinesechess.room.LobbyService;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.room.RoomStatus;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserManager;
import io.github.hulang1024.chinesechess.userstats.UserStatsService;
import io.github.hulang1024.chinesechess.ws.message.AbstractMessageListener;
import io.github.hulang1024.chinesechess.room.ws.LobbyRoomUpdateServerMsg;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PlayMessageListener extends AbstractMessageListener {
    @Autowired
    private LobbyService lobbyService;
    @Autowired
    private RoomManager roomManager;
    @Autowired
    private UserManager userManager;
    @Autowired
    private UserStatsService userStatsService;

    @Override
    public void init() {
        addMessageHandler(ReadyMsg.class, this::ready);
        addMessageHandler(ChessPickMsg.class, this::pickChess);
        addMessageHandler(ChessMoveMsg.class, this::moveChess);
        addMessageHandler(GameOverMsg.class, this::onGameOver);
        addMessageHandler(ConfirmRequestMsg.class, this::onConfirmRequest);
        addMessageHandler(ConfirmResponseMsg.class, this::onConfirmResponse);
        addMessageHandler(GameContinueClientMsg.class, this::onGameContinue);
    }

    public void ready(ReadyMsg readyMsg) {
        User user = userManager.getLoggedInUser(readyMsg.getSession());
        Room room = roomManager.getJoinedRoom(user);

        if (room == null) {
            return;
        }

        room.updateUserReadyState(user, readyMsg.getReadied() != null
            ? readyMsg.getReadied()
            : !room.getUserReadied(user));

        ReadyServerMsg readyServerMsg = new ReadyServerMsg();
        readyServerMsg.setCode(0);
        readyServerMsg.setUid(user.getId());
        readyServerMsg.setReadied(room.getUserReadied(user));

        roomManager.broadcast(room, readyServerMsg);

        lobbyService.broadcast(new LobbyRoomUpdateServerMsg(room), user);

        // 如果全部准备好，开始游戏
        boolean isAllReadied = room.isFull() && room.getUsers().stream()
            .allMatch(u -> room.getUserReadied(u));
        if (isAllReadied) {
            startGame(room);
        }
    }

    private void pickChess(ChessPickMsg chessPickMsg) {
        User user = userManager.getLoggedInUser(chessPickMsg.getSession());
        Room room = roomManager.getJoinedRoom(user);

        if (room.getGame().getState() != GameState.PLAYING) {
            return;
        }

        ChessPickServerMsg chessPickServerMsg = new ChessPickServerMsg();
        chessPickServerMsg.setChessHost(room.getChessHost(user).code());
        chessPickServerMsg.setPos(chessPickMsg.getPos());
        chessPickServerMsg.setPickup(chessPickMsg.isPickup());

        roomManager.broadcast(room, chessPickServerMsg, user);
    }

    private void moveChess(ChessMoveMsg chessMoveMsg) {
        User user = userManager.getLoggedInUser(chessMoveMsg.getSession());
        Room room = roomManager.getJoinedRoom(user);

        if (room.getGame().getState() != GameState.PLAYING) {
            return;
        }

        ChessboardState chessboardState = room.getGame().getChessboardState();

        // 记录动作
        ChessAction action = new ChessAction();
        action.setChessHost(room.getChessHost(user));
        action.setChessType(chessboardState.chessAt(chessMoveMsg.getFromPos(), action.getChessHost()).type);
        action.setFromPos(chessMoveMsg.getFromPos());
        action.setToPos(chessMoveMsg.getToPos());
        if (chessMoveMsg.getMoveType() == 2) {
            action.setEatenChess(chessboardState.chessAt(chessMoveMsg.getToPos(), action.getChessHost()));
        }
        room.getGame().getActionStack().push(action);

        chessboardState.moveChess(
            chessMoveMsg.getFromPos(), chessMoveMsg.getToPos(), room.getChessHost(user));
        
        room.getGame().turnActiveChessHost();

        ChessMoveResult result = new ChessMoveResult();
        result.setChessHost(room.getChessHost(user).code());
        result.setMoveType(chessMoveMsg.getMoveType());
        result.setFromPos(chessMoveMsg.getFromPos());
        result.setToPos(chessMoveMsg.getToPos());

        roomManager.broadcast(room, result);
    }

    private void onConfirmRequest(ConfirmRequestMsg confirmRequestMsg) {
        User user = userManager.getLoggedInUser(confirmRequestMsg.getSession());
        Room room = roomManager.getJoinedRoom(user);

        if (room.getGame().getState() != GameState.PLAYING) {
            return;
        }

        PlayConfirmServerMsg result = new PlayConfirmServerMsg();
        result.setReqType(confirmRequestMsg.getReqType());
        result.setChessHost(room.getChessHost(user).code());

        roomManager.broadcast(room, result);
    }

    private void onConfirmResponse(ConfirmResponseMsg confirmResponseMsg) {
        User user = userManager.getLoggedInUser(confirmResponseMsg.getSession());
        Room room = roomManager.getJoinedRoom(user);

        if (room.getGame().getState() != GameState.PLAYING) {
            return;
        }

        PlayConfirmResponseServerMsg result = new PlayConfirmResponseServerMsg();
        result.setReqType(confirmResponseMsg.getReqType());
        result.setChessHost(room.getChessHost(user).code());
        result.setOk(confirmResponseMsg.isOk());

        if (confirmResponseMsg.isOk()) {
            if (confirmResponseMsg.getReqType() == ConfirmRequestType.WHITE_FLAG.code()) {
                //todo something
            } else if (confirmResponseMsg.getReqType() == ConfirmRequestType.DRAW.code()) {
                //todo something
            } else if (confirmResponseMsg.getReqType() == ConfirmRequestType.WITHDRAW.code()) {
                withdraw(room);
                room.getGame().turnActiveChessHost();
            }
        }

        roomManager.broadcast(room, result);
    }

    private void withdraw(Room room) {
        ChessboardState chessboardState = room.getGame().getChessboardState();
        if (room.getGame().getActionStack().isEmpty()) {
            return;
        }
        ChessAction lastAction = room.getGame().getActionStack().pop();
        chessboardState.moveChess(lastAction.getToPos(), lastAction.getFromPos(), lastAction.getChessHost());
        if (lastAction.getEatenChess() != null) {
            chessboardState.setChess(lastAction.getToPos(), lastAction.getEatenChess(), lastAction.getChessHost());
        }
    }

    private void startGame(Room room) {
        Game round = new Game(room);
        room.setGame(round);

        room.setRoundCount(room.getRoundCount() + 1);

        if (room.getRoundCount() > 1) {
            // 第n个对局，交换棋方
            User redChessUser = room.getRedChessUser();
            User blackChessUser = room.getBlackChessUser();
            room.setBlackChessUser(redChessUser);
            room.setRedChessUser(blackChessUser);
        }

        room.getGame().setState(GameState.PLAYING);

        room.setStatus(RoomStatus.PLAYING);

        roomManager.broadcast(room, new GameStartServerMsg(room.getRedChessUser(), room.getBlackChessUser()));
    }

    private void onGameContinue(GameContinueClientMsg clientMsg) {
        User user = userManager.getLoggedInUser(clientMsg.getSession());
        Room joinedRoom = roomManager.getJoinedRoom(user);
        if (clientMsg.isOk()) {
            if (joinedRoom.getGame().getState() == GameState.PAUSE) {
                // 如果之前房间内用户一直在线并且没离开房间，现在继续游戏
                if (joinedRoom.getOnlineUserCount() == 2) {
                    joinedRoom.getGame().setState(GameState.PLAYING);
                }
            }

            GamePlayStatesServerMsg gamePlayStatesServerMsg = new GamePlayStatesServerMsg();
            gamePlayStatesServerMsg.setStates(joinedRoom.getGame().buildGamePlayStatesResponse());
            send(gamePlayStatesServerMsg, user);
        } else {
            // 如果不想继续，离开房间
            roomManager.partRoom(joinedRoom, user);
        }

        joinedRoom.setOfflineAt(null);

        if (joinedRoom.getOnlineUserCount() > 0) {
            GameContinueResponseServerMsg serverMsg = new GameContinueResponseServerMsg();
            serverMsg.setOk(clientMsg.isOk());
            serverMsg.setUid(user.getId());
            roomManager.broadcast(joinedRoom, serverMsg, user);
        }
    }

    private void onGameOver(GameOverMsg msg) {
        User user = userManager.getLoggedInUser(msg.getSession());
        Room room = roomManager.getJoinedRoom(user);
        room.setStatus(RoomStatus.BEGINNING);
        room.updateUserReadyState(user, false);

        userStatsService.updateUser(user, GameResult.from(msg.getResult()));

        lobbyService.broadcast(new LobbyRoomUpdateServerMsg(room), user);
    }
}
