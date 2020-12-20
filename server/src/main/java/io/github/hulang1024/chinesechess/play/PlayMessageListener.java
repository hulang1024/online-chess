package io.github.hulang1024.chinesechess.play;

import io.github.hulang1024.chinesechess.play.rule.ChessboardState;
import io.github.hulang1024.chinesechess.play.rule.ConfirmRequestType;
import io.github.hulang1024.chinesechess.play.rule.GameResult;
import io.github.hulang1024.chinesechess.play.ws.*;
import io.github.hulang1024.chinesechess.play.ws.servermsg.*;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.room.RoomStatus;
import io.github.hulang1024.chinesechess.room.ws.LobbyRoomUpdateServerMsg;
import io.github.hulang1024.chinesechess.spectator.SpectatorManager;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.activity.UserActivity;
import io.github.hulang1024.chinesechess.user.activity.UserActivityService;
import io.github.hulang1024.chinesechess.userstats.UserStatsService;
import io.github.hulang1024.chinesechess.ws.AbstractMessageListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class PlayMessageListener extends AbstractMessageListener {
    @Autowired
    private UserActivityService userActivityService;
    @Autowired
    private RoomManager roomManager;
    @Autowired
    private SpectatorManager spectatorManager;
    @Autowired
    private UserStatsService userStatsService;

    @Override
    public void init() {
        addMessageHandler(ReadyMsg.class, this::onReady);
        addMessageHandler(ChessPickMsg.class, this::onPickChess);
        addMessageHandler(ChessMoveMsg.class, this::onMoveChess);
        addMessageHandler(ConfirmRequestMsg.class, this::onConfirmRequest);
        addMessageHandler(ConfirmResponseMsg.class, this::onConfirmResponse);
        addMessageHandler(StartGameMsg.class, this::onStartGame);
        addMessageHandler(GameOverMsg.class, this::onGameOver);
        addMessageHandler(GameContinueMsg.class, this::onGameContinue);
    }

    private void onReady(ReadyMsg readyMsg) {
        User user = readyMsg.getUser();
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

        userActivityService.broadcast(UserActivity.IN_LOBBY, new LobbyRoomUpdateServerMsg(room), user);
    }

    private void onStartGame(StartGameMsg msg) {
        Room room = roomManager.getJoinedRoom(msg.getUser());

        boolean isAllReadied = room.getStatus() == RoomStatus.BEGINNING
            && room.getUsers().stream().allMatch(u -> room.getUserReadied(u));
        if (isAllReadied) {
            startGame(room);
        }
    }

    private void onPickChess(ChessPickMsg chessPickMsg) {
        User user = chessPickMsg.getUser();
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

    private void onMoveChess(ChessMoveMsg chessMoveMsg) {
        User user = chessMoveMsg.getUser();
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

        ChessMoveServerMsg result = new ChessMoveServerMsg();
        result.setChessHost(room.getChessHost(user).code());
        result.setMoveType(chessMoveMsg.getMoveType());
        result.setFromPos(chessMoveMsg.getFromPos());
        result.setToPos(chessMoveMsg.getToPos());
        roomManager.broadcast(room, result);
    }

    private void onConfirmRequest(ConfirmRequestMsg confirmRequestMsg) {
        User user = confirmRequestMsg.getUser();
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
        User user = confirmResponseMsg.getUser();
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

        room.setGameCount(room.getGameCount() + 1);

        if (room.getGameCount() > 1) {
            // 第n个对局，交换棋方
            User redChessUser = room.getRedChessUser();
            User blackChessUser = room.getBlackChessUser();
            room.setBlackChessUser(redChessUser);
            room.setRedChessUser(blackChessUser);
        }

        room.setStatus(RoomStatus.PLAYING);

        room.getUsers().forEach(user -> {
            userActivityService.enter(user, UserActivity.PLAYING);
        });

        roomManager.broadcast(room, new GameStartServerMsg(room.getRedChessUser(), room.getBlackChessUser()));
        userActivityService.broadcast(UserActivity.IN_LOBBY, new LobbyRoomUpdateServerMsg(room));

    }

    private void onGameContinue(GameContinueMsg clientMsg) {
        User user = clientMsg.getUser();
        Room joinedRoom = roomManager.getJoinedRoom(user);
        if (clientMsg.isOk()) {
            GamePlayStatesServerMsg gamePlayStatesServerMsg = new GamePlayStatesServerMsg();
            gamePlayStatesServerMsg.setStates(joinedRoom.getGame().buildGameStatesResponse());

            if (joinedRoom.getGame().getState() == GameState.PAUSE) {
                // 如果之前房间内用户一直在线并且没离开房间，现在继续游戏
                if (joinedRoom.getOnlineUserCount() == 2) {
                    joinedRoom.getGame().setState(GameState.PLAYING);
                    GameTimer gameTimer = user.equals(joinedRoom.getRedChessUser())
                        ? joinedRoom.getGame().getRedTimer()
                        : joinedRoom.getGame().getBlackTimer();
                    gameTimer.start(false);
                }
            }

            send(gamePlayStatesServerMsg, user);

            userActivityService.enter(user, UserActivity.PLAYING);
        } else {
            // 如果不想继续，离开房间
            roomManager.partRoom(joinedRoom, user);
        }

        joinedRoom.setOfflineAt(null);

        if (joinedRoom.getOnlineUserCount() > 0) {
            GameContinueResponseServerMsg serverMsg = new GameContinueResponseServerMsg();
            serverMsg.setOk(clientMsg.isOk());
            serverMsg.setUid(user.getId());
            roomManager.broadcast(joinedRoom, serverMsg);
        }
    }

    private void onGameOver(GameOverMsg msg) {
        Room room = roomManager.getJoinedRoom(msg.getUser());
        if (room == null) {
            return;
        }

        room.setStatus(RoomStatus.BEGINNING);
        room.getGame().setState(GameState.END);
        room.getGame().getRedTimer().stop();
        room.getGame().getBlackTimer().stop();

        room.updateUserReadyState(room.getOtherUser(room.getOwner()), false);

        if (msg.getWinUserId() != null) {
            Optional<User> winUserOpt = room.getUsers().stream()
                .filter(user -> user.getId().equals(msg.getWinUserId()))
                .findAny();
            User winUser = winUserOpt.get();
            User loseUser = room.getOtherUser(winUser);
            userStatsService.updateUser(winUser, GameResult.WIN);
            userStatsService.updateUser(loseUser, GameResult.LOSE);
        } else {
            room.getUsers().forEach(user -> {
                userStatsService.updateUser(user, GameResult.DRAW);
            });
        }
        spectatorManager.broadcast(room, new GameOverServerMsg(msg.getWinUserId()));
        userActivityService.broadcast(UserActivity.IN_LOBBY, new LobbyRoomUpdateServerMsg(room));
        room.getUsers().forEach(user -> {
            userActivityService.enter(user, UserActivity.IN_ROOM);
        });
    }
}
