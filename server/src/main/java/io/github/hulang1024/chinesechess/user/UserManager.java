package io.github.hulang1024.chinesechess.user;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import io.github.hulang1024.chinesechess.http.AuthenticationUtils;
import io.github.hulang1024.chinesechess.user.login.LoginResult;
import io.github.hulang1024.chinesechess.user.login.UserLoginParam;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.yeauty.pojo.Session;

import javax.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserManager {
    private static Map<Long, GuestUser> guestUserMap = new ConcurrentHashMap<>();
    private static Map<Long, User> loggedInUserMap = new ConcurrentHashMap<>();
    @Autowired
    private UserDao userDao;

    public User getLoggedInUser(long userId) {
        return loggedInUserMap.get(userId);
    }

    public GuestUser getGuestUser(long userId) {
        return guestUserMap.get(userId);
    }

    public User getLoggedInUser(Session session) {
        Long userId = session.getAttribute(UserSessionManager.USER_ID_KEY);
        return userId != null ? getLoggedInUser(userId) : null;
    }

    public User getGuestUser(Session session) {
        Long userId = session.getAttribute(UserSessionManager.USER_ID_KEY);
        return userId != null ? getGuestUser(userId) : null;
    }

    public void removeGuestUser(User user) {
        guestUserMap.remove(user.getId());
    }

    public User getDatabaseUser(long id) {
        return userDao.selectById(id);
    }


    public RegisterResult register(UserRegisterParam param) {
        User user = new User();
        // todo:验证格式
        user.setNickname(param.getNickname().trim());
        user.setPassword(PasswordUtils.cipherText(param.getPassword().trim()));
        user.setRegisterTime(LocalDateTime.now());
        user.setSource(0);

        try {
            boolean ok = userDao.insert(user) > 0;
            if (!ok) {
                return RegisterResult.fail(1);
            }
        } catch (ConstraintViolationException e) {
            return RegisterResult.fail(2);
        }

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

    public void loginGuestUser(GuestUser user) {
        guestUserMap.put(user.getId(), user);
    }
}
