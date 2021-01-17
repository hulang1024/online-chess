package io.github.hulang1024.chinesechess.user.thirdparty;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import io.github.hulang1024.chinesechess.user.avatar.AvatarFileService;
import io.github.hulang1024.chinesechess.user.*;
import io.github.hulang1024.chinesechess.user.thirdparty.github.api.responses.GitHubUser;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ThirdpartyUserLoginService {
    @Autowired
    private UserDao userDao;
    @Autowired
    private UserManager userManager;
    @Autowired
    private AvatarFileService avatarService;

    private static final long TOKEN_EXPIRES_IN_SECONDS = 24 * 60 * 60 * 7;

    public LoginResult login(GitHubUser githubUser) {
        User user = userDao.selectOne(new QueryWrapper<User>()
            .eq("source", 1)
            .eq("open_id", githubUser.getId().toString()));

        LoginResult result;
        if (user != null) {
            // 更新属性
            updateUser(user, githubUser);

            // 登录
            result = userManager.login(user, TOKEN_EXPIRES_IN_SECONDS);
        } else {
            // 新注册用户
            if (StringUtils.isNotEmpty(githubUser.getAvatarUrl())) {
                githubUser.setAvatarUrl(avatarService.saveFileByUrl(githubUser.getAvatarUrl()));
            }
            UserRegisterParam registerParam = new UserRegisterParam();
            registerParam.setSource(1);
            registerParam.setOpenId(githubUser.getId().toString());
            registerParam.setNickname(githubUser.getLogin());
            registerParam.setEmail(githubUser.getEmail());
            registerParam.setAvatarUrl(githubUser.getAvatarUrl());
            RegisterResult ret = (RegisterResult) userManager.register(registerParam);
            if (ret.isOk()) {
                // 登录
                result = userManager.login(ret.getUser(), TOKEN_EXPIRES_IN_SECONDS);
            } else {
                log.info("RegisterResult code = {}", ret.getCode());
                result = LoginResult.fail(3);
            }
        }

        return result;
    }

    private void updateUser(User user, GitHubUser githubUser) {
        if (StringUtils.isNotEmpty(githubUser.getAvatarUrl())) {
            user.setAvatarUrl(avatarService.saveFileByUrl(githubUser.getAvatarUrl()));
            userDao.updateById(user);
        }
    }

}