package io.github.hulang1024.chinesechess.ban;

import io.github.hulang1024.chinesechess.user.GuestUser;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BanUserManager {
    @Autowired
    private UserDao userDao;

    public boolean isBanned(User user) {
        return user.getUserType() != null && user.getUserType() == 1;
    }

    public void add(User user) {
        user.setUserType(1);
        if (!(user instanceof GuestUser)) {
            userDao.updateById(user);
        }
    }

    public void cancel(User user) {
        user.setUserType(0);
        if (!(user instanceof GuestUser)) {
            userDao.updateById(user);
        }
    }
}