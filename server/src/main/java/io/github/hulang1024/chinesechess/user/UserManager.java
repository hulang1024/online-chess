package io.github.hulang1024.chinesechess.user;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import io.github.hulang1024.chinesechess.database.dao.UserDao;
import io.github.hulang1024.chinesechess.database.entity.EntityUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserManager {
    @Autowired
    private UserDao userDao;

    public User getById(long id) {
        EntityUser entityUser = userDao.selectById(id);
        User user = new User();
        user.setId(entityUser.getId());
        user.setNickname(entityUser.getNickname());

        return user;
    }


    public User register(UserRegisterParam param) {
        EntityUser entityUser = new EntityUser();
        entityUser.setNickname(param.getNickname());
        entityUser.setPassword(PasswordUtils.cipherText(param.getPassword()));
        entityUser.setRegisterTime(LocalDateTime.now());

        boolean ok = userDao.insert(entityUser) > 0;
        if (!ok) {
            return null;
        }

        User user = new User();
        user.setId(entityUser.getId());

        return user;
    }

    public LoginResult login(UserLoginParam param) {
        EntityUser entityUser = userDao.selectOne(
            new QueryWrapper<EntityUser>()
                .eq("nickname", param.getUsername()));
        if (entityUser == null
            || !PasswordUtils.isRight(param.getPassword(), entityUser.getPassword())) {
            return LoginResult.failed();
        }

        LoginResult result = LoginResult.ok();
        result.setUserId(entityUser.getId());
        result.setToken(entityUser.getId().toString());

        User user = new User();
        user.setId(entityUser.getId());
        user.setNickname(entityUser.getNickname());

        OnlineUserManager.addUser(user);

        return result;
    }
}
