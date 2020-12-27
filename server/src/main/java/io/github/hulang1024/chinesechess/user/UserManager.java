package io.github.hulang1024.chinesechess.user;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import io.github.hulang1024.chinesechess.database.DaoPageParam;
import io.github.hulang1024.chinesechess.friend.FriendRelation;
import io.github.hulang1024.chinesechess.friend.FriendUserDao;
import io.github.hulang1024.chinesechess.friend.FriendsManager;
import io.github.hulang1024.chinesechess.http.TokenUtils;
import io.github.hulang1024.chinesechess.http.params.PageParam;
import io.github.hulang1024.chinesechess.http.results.PageRet;
import io.github.hulang1024.chinesechess.user.activity.UserActivityService;
import io.github.hulang1024.chinesechess.utils.IPUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.yeauty.pojo.Session;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class UserManager {
    private static Map<Long, User> loggedInUserMap = new ConcurrentHashMap<>();
    private static Map<Long, UserDeviceInfo> loggedInUserDeviceInfoMap = new ConcurrentHashMap<>();

    @Autowired
    private UserDao userDao;
    @Autowired
    private FriendsManager friendsManager;
    @Autowired
    private FriendUserDao friendUserDao;
    @Autowired
    private UserSessionManager userSessionManager;
    @Autowired
    private UserSessionCloseListener sessionCloseListener;
    @Autowired
    private UserActivityService userActivityService;
    @Autowired
    private HttpServletRequest httpServletRequest;

    public boolean isOnline(User user) {
        return user != null && isOnline(user.getId());
    }

    public boolean isOnline(long userId) {
        User user = loggedInUserMap.get(userId);
        return user != null && userSessionManager.isConnected(userId);
    }

    public User getLoggedInUser(long userId) {
        return loggedInUserMap.get(userId);
    }

    public UserDeviceInfo getUserDeviceInfo(User user) {
        UserDeviceInfo deviceInfo = loggedInUserDeviceInfoMap.get(user.getId());
        return deviceInfo != null ? deviceInfo : UserDeviceInfo.NULL;
    }

    public User getDatabaseUser(long id) {
        return userDao.selectById(id);
    }

    public PageRet<SearchUserInfo> searchUsers(SearchUserParam searchUserParam, PageParam pageParam) {
        User currentUser = UserUtils.get();
        IPage<SearchUserInfo> pageData;
        if (searchUserParam.getOnlyFriends()) {
            if (currentUser == null || currentUser instanceof GuestUser) {
                return new PageRet<>(null);
            }
            pageData = friendUserDao.searchFriends(new DaoPageParam(pageParam),
                new QueryWrapper<User>()
                    .eq("friends.user_id", currentUser.getId())
                    .orderByDesc("last_active_time"));
        } else {
            QueryWrapper query = new QueryWrapper<User>();
            query.orderByDesc("last_active_time");
            IPage<User> userPage = userDao.selectPage(new DaoPageParam(pageParam), query);
            pageData = userPage.convert(u -> new SearchUserInfo(u));
        }

        List<SearchUserInfo> guestUsers = loggedInUserMap.values().stream()
            .filter(user -> user instanceof GuestUser && isOnline(user))
            .map(u -> new SearchUserInfo(u))
            .collect(Collectors.toList());
        pageData.getRecords().addAll(guestUsers);

        pageData.getRecords().forEach(user -> {
            if (currentUser != null && !(currentUser instanceof GuestUser)) {
                Optional<FriendRelation> relation = friendsManager.findUserFriendRelation(currentUser, user);
                user.setIsFriend(relation.isPresent());
                user.setIsMutual(relation.map(r -> r.getIsMutual()).orElse(false));
            }

            user.setIsOnline(isOnline(user.getId()));

            if (user.getIsOnline()) {
                user.setStatus(userActivityService.activityToStatus(
                    userActivityService.getCurrentStatus(user, false)));
                if (user.getStatus() == null) {
                    user.setStatus(UserStatus.ONLINE);
                }
            } else {
                user.setStatus(UserStatus.OFFLINE);
            }

            user.setLoginDeviceOS(getUserDeviceInfo(user).getDeviceOS());
        });

        pageData.setRecords(
            pageData.getRecords().stream()
                .filter(user -> {
                    boolean ret = true;
                    if (searchUserParam.getStatus() != null) {
                        ret = ret && user.getStatus().code == searchUserParam.getStatus();
                    }
                    return ret;
                })
                .sorted((a, b) -> a.getIsOnline() ? b.getIsOnline() ? 0 : -1 : +1)
                .collect(Collectors.toList()));

        pageData.setRecords(pageData.getRecords()
            .subList(0, Math.min(pageData.getRecords().size(), pageParam.getSize())));

        return new PageRet<>(pageData);
    }

    public RegisterResult register(UserRegisterParam param) {
        long length = param.getNickname().trim().length();
        if (!(1 <= length && length <= 20)) {
            return RegisterResult.fail(3);
        }
        if (param.getSource() == 0 && param.getPassword().length() > 20) {
            return RegisterResult.fail(4);
        }

        if (param.getNickname().equalsIgnoreCase("guest")) {
            return RegisterResult.fail(2);
        }

        User user = new User();
        user.setSource(param.getSource());
        user.setOpenId(param.getOpenId());
        if (StringUtils.isNotEmpty(param.getPassword())) {
            user.setPassword(PasswordUtils.cipherText(param.getPassword().trim()));
        }
        user.setNickname(param.getNickname().trim());
        user.setEmail(param.getEmail());
        user.setAvatarUrl(param.getAvatarUrl());
        user.setRegisterTime(LocalDateTime.now());

        try {
            boolean ok = userDao.insert(user) > 0;
            if (!ok) {
                return RegisterResult.fail(1);
            }
        } catch (Exception e) {
            return RegisterResult.fail(2);
        }

        return RegisterResult.ok(user);
    }

    public LoginResult login(UserLoginParam param) {
        User user;
        if ("guest".equalsIgnoreCase(param.getUsername())) {
            GuestUser guestUser = new GuestUser();
            String hexString;
            try {
                hexString = Arrays.stream(IPUtils.getIP(httpServletRequest).split("\\."))
                    .map(p -> Integer.toHexString(Integer.parseInt(p)))
                    .collect(Collectors.joining(""));
                guestUser.setId(-Long.parseLong(hexString, 16));
            } catch (Exception e) {
                hexString = Long.toHexString(guestUser.getId());
            }
            guestUser.setNickname("游客" + hexString);
            user = guestUser;
        } else {
            if (StringUtils.isNotEmpty(param.getToken())) {
                user = TokenUtils.verifyParseUserInfo(param.getToken());
                if (user == null) {
                    return LoginResult.fail(3);
                }
                user = getDatabaseUser(user.getId());
                if (user == null) {
                    return LoginResult.fail(1);
                }
            } else {
                user = userDao.selectOne(
                    new QueryWrapper<User>()
                        .eq("nickname", param.getUsername()));
                if (user == null) {
                    return LoginResult.fail(1);
                }
                if (!PasswordUtils.isRight(param.getPassword(), user.getPassword())) {
                    return LoginResult.fail(2);
                }
            }
        }

        LoginResult result = login(user, null);

        if (!result.isOk()) {
            return result;
        }

        UserDeviceInfo userDeviceInfo = new UserDeviceInfo();
        userDeviceInfo.setDeviceOS(param.getDeviceOS());
        loggedInUserDeviceInfoMap.put(user.getId(), userDeviceInfo);

        return result;
    }

    /**
     * @param user 已验证/存在的用户
     * @return
     */
    public LoginResult login(User user, Long expiresInSeconds) {
        if (!(user instanceof GuestUser)) {
            user.setLastLoginTime(LocalDateTime.now());
            user.setLastActiveTime(user.getLastLoginTime());
            userDao.updateById(user);
        }

        LoginResult result = LoginResult.ok();
        result.setUser(user);
        result.setAccessToken(TokenUtils.generateAccessToken(
            user.getId(), expiresInSeconds == null ? 24 * 60 * 60 : expiresInSeconds));
        loggedInUserMap.put(user.getId(), user);
        return result;
    }

    public boolean logout(User user, boolean apiLogout) {
        Session session = userSessionManager.getSession(user);
        if (session != null) {
            // 并不真的关闭，走关闭的流程
            // TODO：未来onClose实现可能会变化
            sessionCloseListener.onClose(session);
        }
        if (apiLogout) {
            loggedInUserMap.remove(user.getId());
            loggedInUserDeviceInfoMap.remove(user.getId());
        }
        return true;
    }
}
