package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.play.GameState;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.spectator.SpectatorManager;
import io.github.hulang1024.chinesechess.user.activity.UserActivityService;
import io.github.hulang1024.chinesechess.user.ws.UserOfflineServerMsg;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

import java.time.LocalDateTime;

@Component
public class UserSessionCloseListener {
    @Autowired
    private UserManager userManager;
    @Autowired
    private UserSessionManager userSessionManager;
    @Autowired
    private RoomManager roomManager;
    @Autowired
    private SpectatorManager spectatorManager;
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private UserActivityService userActivityService;

    public void onClose(Session session) {
        User user = getLoggedInUser(session);
        if (user == null) {
            // 游客退出
            GuestUser guestUser = getGuestUser(session);
            user = guestUser;
            if (guestUser != null) {
                userManager.guestLogout(session, guestUser);
            }
        } else {
            // 如果加入了房间
            Room joinedRoom = roomManager.getJoinedRoom(user);
            if (joinedRoom != null) {
                switch (joinedRoom.getGame() == null
                    ? GameState.READY : joinedRoom.getGame().getState()) {
                    case PLAYING:
                        // 暂停游戏
                        joinedRoom.getGame().pause();
                        // break;
                    case PAUSE:
                        // 如果游戏已经是暂停状态，是因为上个用户离线导致的
                        UserOfflineServerMsg userOfflineMsg = new UserOfflineServerMsg(user);
                        if (joinedRoom.getOnlineUserCount() > 0) {
                            // 房间内还有在线用户，发送离线消息
                            roomManager.broadcast(joinedRoom, userOfflineMsg, user);
                        } else {
                            // 房间内没有在线用户
                            joinedRoom.setOfflineAt(LocalDateTime.now());
                            spectatorManager.broadcast(joinedRoom, userOfflineMsg);
                        }
                        break;
                    case END:
                    case READY:
                        // 游戏未进行，安全退出
                        roomManager.partRoom(joinedRoom, user);
                        channelManager.leaveChannels(user);
                        break;
                }
            } else {
                // 如果之前是观众，现在离开观看
                Room spectatingRoom = spectatorManager.getSpectatingRoom(user);
                if (spectatingRoom != null) {
                    spectatorManager.leaveRoom(user, spectatingRoom);
                }
                channelManager.leaveChannels(user);
            }

            userSessionManager.removeBinding(user);
        }

        if (user != null) {
            userActivityService.removeUser(user);
        }
    }

    public GuestUser getGuestUser(Session session) {
        Long userId = userSessionManager.getBoundUserId(session);
        return userId != null ? userManager.getGuestUser(userId) : null;
    }

    public User getLoggedInUser(Session session) {
        Long userId = userSessionManager.getBoundUserId(session);
        return userId != null ? userManager.getLoggedInUser(userId) : null;
    }
}
