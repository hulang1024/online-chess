package io.github.hulang1024.chinesechess.user;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.database.DaoPageParam;
import io.github.hulang1024.chinesechess.friend.FriendUserDao;
import io.github.hulang1024.chinesechess.http.AuthenticationUtils;
import io.github.hulang1024.chinesechess.http.params.PageParam;
import io.github.hulang1024.chinesechess.http.results.PageRet;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.spectator.SpectatorManager;
import io.github.hulang1024.chinesechess.user.login.LoginResult;
import io.github.hulang1024.chinesechess.user.login.UserLoginParam;
import io.github.hulang1024.chinesechess.userstats.UserStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.yeauty.pojo.Session;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserManager {
    private static Map<Long, GuestUser> guestUserMap = new ConcurrentHashMap<>();
    private static Map<Long, User> loggedInUserMap = new ConcurrentHashMap<>();
    @Autowired
    private UserDao userDao;
    @Autowired
    private UserStatsService userStatsService;
    @Autowired
    private FriendUserDao friendUserDao;
    @Autowired
    private RoomManager roomManager;
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private SpectatorManager spectatorManager;
    @Autowired
    private UserSessionManager userSessionManager;

    public boolean isOnline(User user) {
        return user != null && isOnline(user.getId());
    }

    public boolean isOnline(long userId) {
        User user = loggedInUserMap.get(userId);
        return user != null && userSessionManager.getSession(user) != null;
    }

    public User getLoggedInUser(long userId) {
        return loggedInUserMap.get(userId);
    }

    public GuestUser getGuestUser(long userId) {
        return guestUserMap.get(userId);
    }

    public User getDatabaseUser(long id) {
        return userDao.selectById(id);
    }

    public PageRet<SearchUserInfo> searchUsers(SearchUserParam searchUserParam, PageParam pageParam) {
        IPage<SearchUserInfo> userPage;
        if (searchUserParam.getOnlyFriends()) {
            userPage = friendUserDao.searchFriends(new DaoPageParam(pageParam),
                new QueryWrapper<User>()
                    .eq("friends.user_id", UserUtils.get().getId())
                    .orderByDesc("win_count", "last_login_time"));
            userPage.getRecords().forEach(user -> {
                user.setIsFriend(true);
            });
        } else {
            userPage = userDao.searchUsers(new DaoPageParam(pageParam),
                new QueryWrapper<User>().orderByDesc("win_count", "last_login_time"));
        }

        userPage.getRecords().forEach(user -> {
            user.setIsOnline(isOnline(user.getId()));
        });

        return new PageRet<>(userPage);
    }

    public RegisterResult register(UserRegisterParam param) {
        long length = param.getNickname().length();
        if (!(1 <= length && length <= 20)) {
            return RegisterResult.fail(3);
        }
        if (param.getPassword().length() > 20) {
            return RegisterResult.fail(4);
        }

        User user = new User();
        user.setNickname(param.getNickname().trim());
        user.setPassword(PasswordUtils.cipherText(param.getPassword().trim()));
        user.setRegisterTime(LocalDateTime.now());
        user.setSource(0);

        try {
            boolean ok = userDao.insert(user) > 0;
            if (!ok) {
                return RegisterResult.fail(1);
            }
        } catch (Exception e) {
            return RegisterResult.fail(2);
        }

        userStatsService.initializeUser(user);

        return RegisterResult.ok();
    }

    public LoginResult login(UserLoginParam param) {
        User user = userDao.selectOne(
            new QueryWrapper<User>()
                .eq("nickname", param.getUsername()));
        if (user == null) {
            return LoginResult.fail(1);
        }
        if (!PasswordUtils.isRight(param.getPassword(), user.getPassword())) {
            return LoginResult.fail(2);
        }

        user.setLastLoginTime(LocalDateTime.now());
        userDao.updateById(user);

        LoginResult result = LoginResult.ok();
        result.setUserId(user.getId());
        result.setAccessToken(AuthenticationUtils.generateAccessToken(user));
        loggedInUserMap.put(user.getId(), user);

        return result;
    }

    public boolean logout(User user) {
        loggedInUserMap.remove(user.getId());

        Room joinedRoom = roomManager.getJoinedRoom(user);
        if (joinedRoom != null) {
            roomManager.partRoom(joinedRoom, user);
        }

        Room spectatingRoom = spectatorManager.getSpectatingRoom(user);
        if (spectatingRoom != null) {
            spectatorManager.leaveRoom(user, spectatingRoom);
        }
        Session session = userSessionManager.getSession(user);

        userSessionManager.removeBinding(user);

        channelManager.leaveDefaultChannels(user);

        guestLogin(session);

        return true;
    }

    public GuestUser guestLogin(Session session) {
        GuestUser guestUser = new GuestUser();
        userSessionManager.setBinding(guestUser, session);
        guestUserMap.put(guestUser.getId(), guestUser);
        channelManager.joinDefaultChannels(guestUser);
        return guestUser;
    }

    public void guestLogout(Session session, GuestUser guestUser) {
        userSessionManager.removeBinding(guestUser);
        guestUserMap.remove(guestUser.getId());
        channelManager.leaveDefaultChannels(guestUser);
    }
}
