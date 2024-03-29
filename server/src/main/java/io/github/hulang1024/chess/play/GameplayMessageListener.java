package io.github.hulang1024.chess.play;

import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import io.github.hulang1024.chess.chat.ChannelManager;
import io.github.hulang1024.chess.chat.InfoMessage;
import io.github.hulang1024.chess.games.*;
import io.github.hulang1024.chess.play.ws.*;
import io.github.hulang1024.chess.play.ws.servermsg.*;
import io.github.hulang1024.chess.room.Room;
import io.github.hulang1024.chess.room.RoomManager;
import io.github.hulang1024.chess.room.RoomStatus;
import io.github.hulang1024.chess.room.ws.LobbyRoomUpdateServerMsg;
import io.github.hulang1024.chess.user.GuestUser;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.user.UserDao;
import io.github.hulang1024.chess.user.UserStatus;
import io.github.hulang1024.chess.user.activity.UserActivity;
import io.github.hulang1024.chess.user.activity.UserActivityService;
import io.github.hulang1024.chess.userstats.UserStatsService;
import io.github.hulang1024.chess.ws.AbstractMessageListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class GameplayMessageListener extends AbstractMessageListener {
    @Autowired
    private UserActivityService userActivityService;
    @Autowired
    private RoomManager roomManager;
    @Autowired
    private UserStatsService userStatsService;
    @Autowired
    private UserDao userDao;
    @Autowired
    private ChannelManager channelManager;

    @Override
    public void init() {
        addMessageHandler(StartGameMsg.class, this::onStartGame);
        addMessageHandler(PauseGameMsg.class, this::onPauseGame);
        addMessageHandler(ResumeGameMsg.class, this::onResumeGame);
        addMessageHandler(GameOverMsg.class, this::onGameOver);
        addMessageHandler(GameContinueMsg.class, this::onGameContinue);
        addMessageHandler(ReadyMsg.class, this::onReady);
        addMessageHandler(WhiteFlagMsg.class, this::onWhiteFlag);
        addMessageHandler(ConfirmRequestMsg.class, this::onConfirmRequest);
        addMessageHandler(ConfirmResponseMsg.class, this::onConfirmResponse);
        addMessageHandler(ChatStatusInGameMsg.class, this::onChatStatusInGameMsg);
    }

    private void onReady(ReadyMsg readyMsg) {
        User user = readyMsg.getUser();
        Room room = roomManager.getJoinedRoom(user);

        if (room == null) {
            return;
        }

        GameUser gameUser = room.getGameUser(user).get();
        gameUser.setReady(readyMsg.getIsReady() != null
            ? readyMsg.getIsReady()
            : !gameUser.isReady());

        ReadyServerMsg readyServerMsg = new ReadyServerMsg();
        readyServerMsg.setCode(0);
        readyServerMsg.setUid(user.getId());
        readyServerMsg.setReady(gameUser.isReady());

        roomManager.broadcast(room, readyServerMsg);

        userActivityService.broadcast(UserActivity.IN_LOBBY, new LobbyRoomUpdateServerMsg(room), user);
    }

    private void onStartGame(StartGameMsg msg) {
        Room room = roomManager.getJoinedRoom(msg.getUser());

        boolean isAllReady = room.getStatus() == RoomStatus.BEGINNING
            && room.getGameUsers().stream().allMatch(u -> u.isReady());
        // 全部准备好
        if (isAllReady) {
            // 确保其中一个不是离开状态
            boolean isAllInRoom = room.getStatus() == RoomStatus.BEGINNING
                && room.getGameUsers().stream().allMatch(u -> u.getStatus() == UserStatus.IN_ROOM);
            if (isAllInRoom) {
                startGame(room);
            }
        }
    }

    private void onPauseGame(PauseGameMsg msg) {
        pauseGame(roomManager.getJoinedRoom(msg.getUser()));
    }

    private void onResumeGame(ResumeGameMsg msg) {
        resumeGame(roomManager.getJoinedRoom(msg.getUser()));
    }

    private void onWhiteFlag(WhiteFlagMsg msg) {
        User user = msg.getUser();
        Room room = roomManager.getJoinedRoom(user);
        if (room == null) {
            return;
        }
        GameState gameState = room.getGame().getState();
        if (!(gameState == GameState.PLAYING || gameState == GameState.PAUSE)) {
            return;
        }

        List<GameUser> otherUsers = room.getOtherUsers(user).collect(Collectors.toList());
        if (otherUsers.isEmpty()) {
            return;
        }
        channelManager.broadcast(room.getChannel(), new InfoMessage(user.getNickname() + " 认输"));
        gameOver(room, otherUsers.get(0).getChess(), GameOverCause.WHITE_FLAG);
    }

    private void onConfirmRequest(ConfirmRequestMsg confirmRequestMsg) {
        User user = confirmRequestMsg.getUser();
        Room room = roomManager.getJoinedRoom(user);

        if (room.getGame() == null || room.getGame().getState() == null) {
            return;
        }

        PlayConfirmServerMsg result = new PlayConfirmServerMsg(user);
        result.setReqType(confirmRequestMsg.getReqType());

        roomManager.broadcast(room, result, user);
    }

    private void onConfirmResponse(ConfirmResponseMsg confirmResponseMsg) {
        User user = confirmResponseMsg.getUser();
        Room room = roomManager.getJoinedRoom(user);

        if (room == null || room.getGame() == null || room.getGame().getState() == null) {
            return;
        }

        PlayConfirmResponseServerMsg result = new PlayConfirmResponseServerMsg(user);
        result.setReqType(confirmResponseMsg.getReqType());
        result.setOk(confirmResponseMsg.isOk());

        if (confirmResponseMsg.isOk()) {
            if (confirmResponseMsg.getReqType() == ConfirmRequestType.DRAW.code()) {
                gameOver(room, 0, GameOverCause.DRAW);
            } else if (confirmResponseMsg.getReqType() == ConfirmRequestType.WITHDRAW.code()) {
                withdraw(room);
            } else if (confirmResponseMsg.getReqType() == ConfirmRequestType.PAUSE_GAME.code()) {
                pauseGame(room);
            } else if (confirmResponseMsg.getReqType() == ConfirmRequestType.RESUME_GAME.code()) {
                resumeGame(room);
            }
        }

        roomManager.broadcast(room, result, user);
    }

    private void startGame(Room room) {
        GameContext gameContext = new GameContext();
        gameContext.setGameRuleset(room.getRuleset());
        gameContext.setGameSettings(room.getGameSettings());
        gameContext.setGameUsers(room.getGameUsers());

        Game round = GameFactory.createGame(gameContext);
        room.setGame(round);
        round.start();

        room.setGameCount(room.getGameCount() + 1);

        if (room.getGameCount() > 1) {
            // 第n个对局，交换棋方
            gameContext.getGameRuleset().onNewRound(room);
        }

        room.getGameUsers().forEach(gameUser -> {
            userActivityService.enter(gameUser.getUser(), UserActivity.PLAYING);
        });
        roomManager.broadcast(room, new GameStartServerMsg(round));
        userActivityService.broadcast(UserActivity.IN_LOBBY, new LobbyRoomUpdateServerMsg(room));
        channelManager.broadcast(room.getChannel(), new InfoMessage("对局开始"));
    }

    private void pauseGame(Room room) {
        if (room.getGame() == null || room.getGame().getState() != GameState.PLAYING) {
            return;
        }

        room.getGame().pause();

        room.getGameUsers().forEach(gameUser -> {
            userActivityService.enter(gameUser.getUser(), UserActivity.IN_ROOM);
        });

        roomManager.broadcast(room, new GamePauseServerMsg());
    }

    private void resumeGame(Room room) {
        if (room.getGame() == null ||
            room.getGame().getState() != GameState.PAUSE ||
            room.getOfflineAt() != null) {
            return;
        }

        room.getGame().resume();

        room.setStatus(RoomStatus.PLAYING);

        room.getGameUsers().forEach(gameUser -> {
            userActivityService.enter(gameUser.getUser(), UserActivity.IN_ROOM);
        });
        roomManager.broadcast(room, new GameResumeServerMsg());
    }

    private void onGameContinue(GameContinueMsg clientMsg) {
        User user = clientMsg.getUser();
        Room joinedRoom = roomManager.getJoinedRoom(user);
        if (joinedRoom == null) {
            return;
        }

        if (clientMsg.isOk()) {
            if (joinedRoom.getStatus() == RoomStatus.DISMISSED ||
                joinedRoom.getGame().getState() == GameState.PLAYING) {
                return;
            }
            GameStatesServerMsg gamePlayStatesServerMsg = new GameStatesServerMsg();
            gamePlayStatesServerMsg.setStates(joinedRoom.getGame().buildGameStatesResponse());
            gamePlayStatesServerMsg.getStates().setRoom(joinedRoom);

            if (joinedRoom.getGame().getState() == GameState.PAUSE) {
                User otherUser = joinedRoom.getOtherUser(user).getUser();
                UserActivity otherUserStatus = userActivityService.getCurrentStatus(otherUser);
                if (otherUserStatus == UserActivity.IN_ROOM) {
                    joinedRoom.getGame().resume();
                    joinedRoom.setStatus(RoomStatus.PLAYING);
                    userActivityService.enter(user, UserActivity.PLAYING);
                    userActivityService.enter(otherUser, UserActivity.PLAYING);
                } else {
                    userActivityService.enter(user, UserActivity.IN_ROOM);
                }
            }

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
        Room room = roomManager.getJoinedRoom(msg.getUser());
        if (room == null) {
            return;
        }

        gameOver(room, msg.getWinHost(), GameOverCause.from(msg.getCause()));
    }

    private void withdraw(Room room) {
        room.getGame().withdraw();
        roomManager.broadcast(room, new ChessWithdrawServerMsg());
    }

    private void gameOver(Room room, int winHost, GameOverCause cause) {
        room.setStatus(RoomStatus.BEGINNING);
        Game game = room.getGame();
        GameType gameType = game.getGameSettings().getGameType();
        game.over();

        room.getOtherUser(room.getOwner()).setReady(false);

        List<User> winUsers = new ArrayList<>();
        List<User> loseUsers = new ArrayList<>();
        if (winHost != 0) {
            room.getGameUsers().stream()
                .forEach(user -> {
                    (user.getChess() == winHost ? winUsers : loseUsers).add(user.getUser());
                });
            // 保存分数
            if (game.getGameSettings().isEnableRanking()) {
                // todo: 批量保存
                winUsers.forEach(user -> {
                    userStatsService.updateUser(user, gameType, GameResult.WIN);
                });
                loseUsers.forEach(user -> {
                    userStatsService.updateUser(user, gameType, GameResult.LOSE);
                });
            }
        } else {
            // 保存分数
            if (game.getGameSettings().isEnableRanking()) {
                room.getGameUsers().forEach(gameUser -> {
                    userStatsService.updateUser(gameUser.getUser(), gameType, GameResult.DRAW);
                });
            }
        }

        Object[] userIds = room.getGameUsers().stream()
            .map(gameUser -> gameUser.getUser())
            .filter(user -> !(user instanceof GuestUser))
            .map(user -> user.getId())
            .toArray();
        if (userIds.length > 0) {
            userDao.update(null,
                new UpdateWrapper<User>()
                    .set("play_game_type", gameType.getCode())
                    .in("id", userIds));
        }

        roomManager.broadcast(room, new GameOverServerMsg(winHost, cause));
        userActivityService.broadcast(UserActivity.IN_LOBBY, new LobbyRoomUpdateServerMsg(room));
        room.getGameUsers().forEach(gameUser -> {
            gameUser.getUser().setPlayGameType(gameType.getCode());
            userActivityService.enter(gameUser.getUser(), UserActivity.IN_ROOM);
        });

        String content = null;
        if (winHost == 0) {
            content = "平局";
        } else {
            String nicknames = winUsers.stream()
                .map(user -> user.getNickname())
                .collect(Collectors.joining(","));
            content = nicknames + "胜";
        }
        channelManager.broadcast(room.getChannel(), new InfoMessage(content));
    }

    private void onChatStatusInGameMsg(ChatStatusInGameMsg msg) {
        User user = msg.getUser();
        Room room = roomManager.getJoinedRoom(user);
        roomManager.broadcast(room, new ChatStatusInGameServerMsg(user.getId(), msg.isTyping()), user);
    }
}