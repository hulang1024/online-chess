package io.github.hulang1024.chess.user.activity;

import io.github.hulang1024.chess.room.Room;
import io.github.hulang1024.chess.room.RoomManager;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.user.UserStatus;
import io.github.hulang1024.chess.user.ws.UserStatusChangedServerMsg;
import io.github.hulang1024.chess.ws.ServerMessage;
import io.github.hulang1024.chess.ws.WSMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

@Service
public class UserActivityService {
    /** 记录 活动状态 -> 加入的用户 */
    private static Map<UserActivity, List<User>> activityUsersMap = new ConcurrentHashMap<>();

    /** 记录用户最新活动状态，不包括AFK */
    private static Map<Long, UserActivity> userCurrentStatusMap = new ConcurrentHashMap<>();

    /** 记录AFK的用户 */
    private static Map<Long, User> userAFKStatusMap = new ConcurrentHashMap<>();

    @Autowired
    private RoomManager roomManager;

    static {
        for (UserActivity ua : UserActivity.values()) {
            activityUsersMap.put(ua, new ArrayList<>());
        }
    }

    @Autowired
    private WSMessageService wsMessageService;

    public UserActivity getCurrentStatus(User user) {
        return getCurrentStatus(user, true);
    }

    public UserActivity getCurrentStatus(User user, boolean ignoreAFK) {
        if (user == null) {
            return null;
        }
        if (!ignoreAFK && userAFKStatusMap.containsKey(user.getId())) {
            return UserActivity.AFK;
        }
        return userCurrentStatusMap.get(user.getId());
    }

    public void enter(User user, UserActivity statusToEnter) {
        if (statusToEnter == null) {
            return;
        }
        List<User> users = activityUsersMap.get(statusToEnter);
        if (!users.contains(user)) {
            users.add(user);
        }

        if (statusToEnter == UserActivity.VIEW_ONLINE_USER) {
            return;
        }

        switch (statusToEnter) {
            case IN_ROOM:
                exit(user, UserActivity.IN_LOBBY, false);
                exit(user, UserActivity.PLAYING, false);
                break;
            case PLAYING:
                exit(user, UserActivity.IN_LOBBY, false);
                exit(user, UserActivity.IN_ROOM, false);
                break;
            case SPECTATING:
                exit(user, UserActivity.IN_LOBBY, false);
                break;
            default:
                break;
        }

        if (statusToEnter == UserActivity.AFK) {
            userAFKStatusMap.put(user.getId() ,user);
        } else {
            userCurrentStatusMap.put(user.getId(), statusToEnter);
        }

        if (statusToEnter == UserActivity.AFK
            || (statusToEnter != UserActivity.AFK && userAFKStatusMap.get(user.getId()) == null)) {
            // 进入新的状态同时当前不是AFK时才通知客户端更新
            UserStatus newUserStatus = activityToStatus(statusToEnter);
            broadcast(user, newUserStatus != null ? newUserStatus : UserStatus.ONLINE);
        }
    }

    public void exit(User user, UserActivity activityToExit) {
        exit(user, activityToExit, true);
    }

    public void exit(User user, UserActivity activityToExit, boolean doBroadcast) {
        activityUsersMap.get(activityToExit).remove(user);

        if (activityToExit == UserActivity.AFK) {
            userAFKStatusMap.remove(user.getId());
            enter(user, getCurrentStatus(user));
        }
    }

    public void removeUser(User user) {
        activityUsersMap.values().forEach(users -> users.remove(user));
        userCurrentStatusMap.remove(user.getId());
        userAFKStatusMap.remove(user.getId());
    }

    public UserStatus activityToStatus(UserActivity activity) {
        if (activity == null) {
            return null;
        }
        switch (activity) {
            case AFK:
                return UserStatus.AFK;
            case IN_LOBBY:
                return UserStatus.IN_LOBBY;
            case IN_ROOM:
                return UserStatus.IN_ROOM;
            case PLAYING:
                return UserStatus.PLAYING;
            case SPECTATING:
                return UserStatus.SPECTATING;
            default:
                return null;
        }
    }

    private void broadcast(User user, UserStatus newUserStatus) {
        UserStatusChangedServerMsg msg = new UserStatusChangedServerMsg(user, newUserStatus);
        broadcast(UserActivity.VIEW_ONLINE_USER, msg);
        Room joinedRoom = roomManager.getJoinedRoom(user);
        if (joinedRoom != null) {
            roomManager.broadcast(joinedRoom, msg);
        }
    }

    public void broadcast(UserActivity userActivity, ServerMessage message, User... excludes) {
        broadcast(userActivity, ($) -> message, excludes.length == 0 ? null : excludes[0]);
    }

    public void broadcast(UserActivity userActivity, Function<User, ServerMessage> messageBuilder, User exclude) {
        activityUsersMap.get(userActivity).forEach(user -> {
            if (user.equals(exclude)) {
                return;
            }
            wsMessageService.send(messageBuilder.apply(user), user);
        });
    }
}