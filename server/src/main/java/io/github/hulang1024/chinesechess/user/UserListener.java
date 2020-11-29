package io.github.hulang1024.chinesechess.user;

import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.play.GameState;
import io.github.hulang1024.chinesechess.play.ws.servermsg.GameContinueServerMsg;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.user.ws.UserLoginClientMsg;
import io.github.hulang1024.chinesechess.user.ws.UserLoginServerMsg;
import io.github.hulang1024.chinesechess.user.ws.UserOnlineServerMsg;
import io.github.hulang1024.chinesechess.ws.AbstractMessageListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

import java.time.LocalDateTime;

@Component
public class UserListener extends AbstractMessageListener {
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
        // 如果是游客登录
        if (loginMsg.getUserId() < 0) {
            User user = userManager.guestLogin(loginMsg.getSession());
            send(new UserLoginServerMsg(0), user);
            return;
        }

        // 如果非游客登录，但是之前游客登录过
        GuestUser guestUser = getGuestUser(loginMsg.getSession());
        if (guestUser != null) {
            // 登出游客
            userManager.guestLogout(loginMsg.getSession(), guestUser);
        }

        // 验证http api是否登录过
        User user = userManager.getLoggedInUser(loginMsg.getUserId());
        if (user == null) {
            wsMessageService.send(new UserLoginServerMsg(3), loginMsg.getSession());
            return;
        }

        // 验证别处websocket登录过
        Session otherSession = userSessionManager.getSession(user);
        if (otherSession != null) {
            // 让此session解除关联
            userSessionManager.removeBinding(user);
            // 此session游客登录
            userManager.guestLogin(otherSession);
            send(new UserLoginServerMsg(2), user);
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
        if (joinedRoom != null && joinedRoom.getGame().getState() == GameState.PAUSE) {
            // 发送继续询问消息
            send(new GameContinueServerMsg(), user);
            // 通知房间内上线用户该用户已上线
            roomManager.broadcast(joinedRoom, new UserOnlineServerMsg(user), user);
        }

        send(new UserLoginServerMsg(0), user);

        // TODO：修改登录时间，后面独立出一个字段，不使用API last_login_time
        userDao.update(null,
            new UpdateWrapper<User>()
                .set("last_login_time", LocalDateTime.now())
                .eq("id", user.getId()));
    }

    public GuestUser getGuestUser(Session session) {
        Long userId = userSessionManager.getBoundUserId(session);
        return userId != null ? userManager.getGuestUser(userId) : null;
    }
}
