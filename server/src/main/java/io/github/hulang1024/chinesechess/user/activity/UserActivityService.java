package io.github.hulang1024.chinesechess.user.activity;

import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.user.GuestUser;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserStatus;
import io.github.hulang1024.chinesechess.user.ws.UserStatusChangedServerMsg;
import io.github.hulang1024.chinesechess.ws.ServerMessage;
import io.github.hulang1024.chinesechess.ws.WSMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserActivityService {
    private static Map<UserActivity, List<User>> activityUsersMap = new ConcurrentHashMap<>();
    private static Map<Long, UserActivity> userCurrentStatusMap = new ConcurrentHashMap<>();
    private static Map<Long, UserActivity> userPreviousStatusMap = new ConcurrentHashMap<>();
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
        UserActivity status = userCurrentStatusMap.get(user.getId());
        return (ignoreAFK && status == UserActivity.AFK) ? getPreviousStatus(user) : status;
    }

    public UserActivity getPreviousStatus(User user) {
        return userPreviousStatusMap.get(user.getId());
    }

    public void broadcast(UserActivity userActivity, ServerMessage message, User... excludes) {
        User exclude = excludes.length == 0 ? null : excludes[0];
        activityUsersMap.get(userActivity).forEach(user -> {
            if (user.equals(exclude)) {
                return;
            }
            wsMessageService.send(message, user);
        });
    }

    public void enter(User user, UserActivity nowStatus) {
        List<User> users = activityUsersMap.get(nowStatus);
        if (!users.contains(user)) {
            users.add(user);
        }

        if (user instanceof GuestUser) {
            return;
        }

        if (nowStatus == UserActivity.VIEW_ONLINE_USER) {
            return;
        }

        UserActivity prevStatus = getCurrentStatus(user, false);
        if (prevStatus != null) {
            userPreviousStatusMap.put(user.getId(), prevStatus);
        }

        switch (nowStatus) {
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

        userCurrentStatusMap.put(user.getId(), nowStatus);

        UserStatus newUserStatus =  activityToStatus(nowStatus);
        if (newUserStatus != null) {
            broadcast(user, newUserStatus);
        }
    }

    public void exit(User user, UserActivity activityToExit) {
        exit(user, activityToExit, true);
    }

    public void exit(User user, UserActivity activityToExit, boolean doBroadcast) {
        activityUsersMap.get(activityToExit).remove(user);
        // 保留当前状态，直到下一个状态覆盖

        if (user instanceof GuestUser) {
            return;
        }

        if (activityToExit == UserActivity.AFK) {
            UserActivity prevStatus = getPreviousStatus(user);
            if (prevStatus != null) {
                enter(user, prevStatus);
            }
        }
    }

    public void removeUser(User user) {
        activityUsersMap.values().forEach(users -> users.remove(user));
        userCurrentStatusMap.remove(user.getId());
        userPreviousStatusMap.remove(user.getId());
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
            roomManager.broadcast(joinedRoom, msg, user);
        }
    }

}
