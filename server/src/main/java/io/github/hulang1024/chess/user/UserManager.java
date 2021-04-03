package io.github.hulang1024.chess.user;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import io.github.hulang1024.chess.ban.BanUserManager;
import io.github.hulang1024.chess.ban.IpBanManager;
import io.github.hulang1024.chess.database.DaoPageParam;
import io.github.hulang1024.chess.friend.FriendRelation;
import io.github.hulang1024.chess.friend.FriendUserDao;
import io.github.hulang1024.chess.friend.FriendsManager;
import io.github.hulang1024.chess.http.TokenUtils;
import io.github.hulang1024.chess.http.params.PageParam;
import io.github.hulang1024.chess.http.results.PageRet;
import io.github.hulang1024.chess.user.activity.UserActivityService;
import io.github.hulang1024.chess.userstats.UserStats;
import io.github.hulang1024.chess.userstats.UserStatsDao;
import io.github.hulang1024.chess.utils.IPUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.yeauty.pojo.Session;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class UserManager {
    private static Map<Long, User> loggedInUserMap = new ConcurrentHashMap<>();
    private static Map<Long, UserDeviceInfo> loggedInUserDeviceInfoMap = new ConcurrentHashMap<>();

    @Autowired
    private UserDao userDao;
    @Autowired
    private UserStatsDao userStatsDao;
    @Autowired
    private FriendsManager friendsManager;
    @Autowired
    private FriendUserDao friendUserDao;
    @Autowired
    private IpBanManager ipBanManager;
    @Autowired
    private BanUserManager banUserManager;
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

    public Collection<User> getLoggedInUsers() {
        return loggedInUserMap.values();
    }

    public UserDeviceInfo getUserDeviceInfo(User user) {
        UserDeviceInfo deviceInfo = loggedInUserDeviceInfoMap.get(user.getId());
        return deviceInfo != null ? deviceInfo : UserDeviceInfo.NULL;
    }

    public UserStatus getUserStatus(User user, boolean isOnline) {
        UserStatus userStatus;
        if (isOnline) {
            userStatus = userActivityService.activityToStatus(
                userActivityService.getCurrentStatus(user, false));
            if (userStatus == null) {
                userStatus = UserStatus.ONLINE;
            }
        } else {
            userStatus = UserStatus.OFFLINE;
        }
        return userStatus;
    }

    public UserStatus getUserStatus(User user) {
        return getUserStatus(user, isOnline(user.getId()));
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

            user.setUserIp(null);
            user.setIsOnline(isOnline(user.getId()));
            user.setStatus(getUserStatus(user, user.getIsOnline()));
            user.setUserDeviceInfo(getUserDeviceInfo(user));
        });

        pageData.setRecords(
            pageData.getRecords().stream()
                .filter(user -> {
                    boolean ret = true;
                    if (searchUserParam.getStatus() != null) {
                        ret = ret && user.getStatus().code == searchUserParam.getStatus();
                    }
                    if (searchUserParam.getOnline() != null) {
                        ret = ret && user.getStatus().code != UserStatus.OFFLINE.code;
                    }
                    return ret;
                })
                .sorted((a, b) -> a.getIsOnline() ? b.getIsOnline() ? 0 : -1 : +1)
                .collect(Collectors.toList()));

        pageData.setRecords(pageData.getRecords()
            .subList(0, Math.min(pageData.getRecords().size(), pageParam.getSize())));

        return new PageRet<>(pageData);
    }

    public UserDetails queryUser(long id) {
        User user = getLoggedInUser(id);
        if (user != null) {
            UserDetails userInfo = new UserDetails(user);
            userInfo.setUserDeviceInfo(getUserDeviceInfo(user));
            user = userInfo;
        } else if (id > 0) {
            user = new UserDetails(getDatabaseUser(id));
        }

        if (user != null) {
            UserDetails userInfo = (UserDetails)user;
            List<UserStats> userStats = userStatsDao.selectList(
                new QueryWrapper<UserStats>().eq("user_id", id));
            userInfo.setScoreStats(userStats);
            Optional<FriendRelation> relation = friendsManager.findUserFriendRelation(UserUtils.get(), user);
            userInfo.setIsFriend(relation.isPresent());
            userInfo.setIsMutual(relation.map(r -> r.getIsMutual()).orElse(false));
        }

        return (UserDetails)user;
    }

    public RegisterResult register(UserRegisterParam param) {
        String ip = IPUtils.getIP(httpServletRequest);
        if (ipBanManager.isBanned(ip)) {
            return RegisterResult.fail(100);
        }

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
        user.setUserType(0);
        user.setUserIp(ip);

        try {
            boolean ok = userDao.insert(user) > 0;
            if (!ok) {
                return RegisterResult.fail(1);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return RegisterResult.fail(2);
        }

        return RegisterResult.ok(user);
    }

    public LoginResult login(UserLoginParam param) {
        User user;
        if ("guest".equalsIgnoreCase(param.getUsername())) {
            GuestUser guestUser = new GuestUser();
            String hexString = null;
            try {
                String ip = IPUtils.getIP(httpServletRequest);
                if (ip != null) {
                    hexString = Arrays.stream(ip.split("\\."))
                        .map(p -> Integer.toHexString(Integer.parseInt(p)))
                        .collect(Collectors.joining(""));
                    guestUser.setId(-Long.parseLong(hexString, 16));
                }
            } catch (Exception e) { }
            if (hexString == null) {
                hexString = Long.toHexString(Math.abs(guestUser.getId()));
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

        return result;
    }

    public void bindLoginDevice(User user, UserDeviceInfo userDeviceInfo) {
        loggedInUserDeviceInfoMap.put(user.getId(), userDeviceInfo);
    }

    /**
     * @param user 已验证/存在的用户
     * @return
     */
    public LoginResult login(User user, Long expiresInSeconds) {
        if (banUserManager.isBanned(user)) {
            return LoginResult.fail(100);
        }

        String ip = IPUtils.getIP(httpServletRequest);

        if (ipBanManager.isBanned(ip)) {
            return LoginResult.fail(100);
        }

        user.setUserIp(ip);
        user.setLastLoginTime(LocalDateTime.now());
        user.setLastActiveTime(user.getLastLoginTime());

        if (!(user instanceof GuestUser)) {
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
            sessionCloseListener.onClose(session, apiLogout);
        }
        return true;
    }

    public boolean logoutAPI(User user) {
        loggedInUserDeviceInfoMap.remove(user.getId());
        return loggedInUserMap.remove(user.getId()) != null;
    }
}