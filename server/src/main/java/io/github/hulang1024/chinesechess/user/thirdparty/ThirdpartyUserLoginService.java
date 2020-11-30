package io.github.hulang1024.chinesechess.user.thirdparty;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import io.github.hulang1024.chinesechess.upload.AvatarService;
import io.github.hulang1024.chinesechess.user.*;
import io.github.hulang1024.chinesechess.user.LoginResult;
import io.github.hulang1024.chinesechess.user.thirdparty.github.api.responses.GitHubUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;

@Service
public class ThirdpartyUserLoginService {
    @Autowired
    private UserDao userDao;
    @Autowired
    private UserManager userManager;
    @Autowired
    private AvatarService avatarService;
    @Autowired
    private HttpServletRequest request;

    public LoginResult login(GitHubUser githubUser) {
        User user = userDao.selectOne(new QueryWrapper<User>()
            .eq("source", 1)
            .eq("open_id", githubUser.getId().toString()));

        LoginResult result;
        if (user != null) {
            result = userManager.login(user);
        } else {
            githubUser.setAvatarUrl(avatarService.saveAvatarByUrl(githubUser.getAvatarUrl()));

            UserRegisterParam registerParam = new UserRegisterParam();
            registerParam.setSource(1);
            registerParam.setOpenId(githubUser.getId().toString());
            registerParam.setNickname(githubUser.getLogin());
            registerParam.setEmail(githubUser.getEmail());
            registerParam.setAvatarUrl(githubUser.getAvatarUrl());
            RegisterResult ret = userManager.register(registerParam);
            if (ret.getCode() == 0) {
                return userManager.login(ret.getUser());
            } else {
                result = LoginResult.fail(3);
            }
        }

        return result;
    }


}
