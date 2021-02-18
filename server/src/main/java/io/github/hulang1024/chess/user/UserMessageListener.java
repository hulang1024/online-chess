package io.github.hulang1024.chess.user;

import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import io.github.hulang1024.chess.chat.ChannelManager;
import io.github.hulang1024.chess.play.GameState;
import io.github.hulang1024.chess.play.ws.servermsg.GameContinueServerMsg;
import io.github.hulang1024.chess.room.Room;
import io.github.hulang1024.chess.room.RoomManager;
import io.github.hulang1024.chess.user.ws.UserLoginClientMsg;
import io.github.hulang1024.chess.user.ws.UserLoginServerMsg;
import io.github.hulang1024.chess.user.ws.UserOnlineServerMsg;
import io.github.hulang1024.chess.ws.AbstractMessageListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

import java.time.LocalDateTime;

@Component
public class UserMessageListener extends AbstractMessageListener {
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private UserDao userDao;
    @Autowired
    private UserManager userManager;
    @Autowired
    private UserSessionManager userSessionManager;
    @Autowired
    private RoomManager roomManager;

    @Override
    public void init() {
        addMessageHandler(UserLoginClientMsg.class, this::onLogin);
    }

    private void onLogin(UserLoginClientMsg loginMsg) {
        // 验证http api是否登录过
        User user = userManager.getLoggedInUser(loginMsg.getUserId());
        if (user == null) {
            wsMessageService.send(new UserLoginServerMsg(3), loginMsg.getSession());
            return;
        }

        // 验证别处websocket登录过
        Session otherSession = userSessionManager.getSession(user);
        if (otherSession != null && otherSession.id().compareTo(loginMsg.getSession().id()) != 0) {
            send(new UserLoginServerMsg(2), user);
            userManager.logout(user, false);
        }

        // 验证该session已绑定过其它用户(很可能是游客登录过）
        Long boundOldUserId = userSessionManager.getBoundUserId(loginMsg.getSession());
        if (boundOldUserId != null) {
            User oldUser = userManager.getLoggedInUser(boundOldUserId);
            if (oldUser != null) {
                userManager.logout(oldUser, false);
            }
        }

        // 绑定新session
        boolean isOk = userSessionManager.setBinding(user, loginMsg.getSession());
        if (!isOk) {
            send(new UserLoginServerMsg(1), user);
            return;
        }

        // 加入频道
        channelManager.joinDefaultChannels(user);

        // 之前进入过游戏但中途退出
        Room joinedRoom = roomManager.getJoinedRoom(user);
        if (joinedRoom != null && joinedRoom.getGame() != null
            && joinedRoom.getGame().getState() == GameState.PAUSE) {
            // 发送继续询问消息
            send(new GameContinueServerMsg(), user);
            // 通知房间内上线用户该用户已上线
            roomManager.broadcast(joinedRoom, new UserOnlineServerMsg(user), user);
        }

        send(new UserLoginServerMsg(0), user);

        user.setLastActiveTime(LocalDateTime.now());
        if (!(user instanceof GuestUser)) {
            userDao.update(null,
                new UpdateWrapper<User>()
                    .set("last_active_time", user.getLastActiveTime())
                    .eq("id", user.getId()));
        }
    }
}