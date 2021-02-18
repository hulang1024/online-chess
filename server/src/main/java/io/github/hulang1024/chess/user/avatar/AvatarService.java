package io.github.hulang1024.chess.user.avatar;

import com.alibaba.druid.util.StringUtils;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.user.UserDao;
import io.github.hulang1024.chess.user.UserManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AvatarService {
    @Autowired
    private AvatarFileService avatarFileService;
    @Autowired
    private UserDao userDao;
    @Autowired
    private UserManager userManager;

    @PostMapping("/avatar")
    public AvatarUploadResult update(User user, MultipartFile file) {
        String url = avatarFileService.saveFile(file);
        if (StringUtils.isEmpty(url)) {
            return AvatarUploadResult.fail();
        }
        user = userManager.getLoggedInUser(user.getId());
        user.setAvatarUrl(url);
        boolean ok = userDao.update(
            null,
            new UpdateWrapper<User>()
                .set("avatar_url", url)
                .eq("id", user.getId())) > 0;
        return new AvatarUploadResult(url);
    }
}