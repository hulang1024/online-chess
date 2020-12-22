package io.github.hulang1024.chinesechess.user.avatar;

import com.alibaba.druid.util.StringUtils;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserDao;
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

    @PostMapping("/avatar")
    public AvatarUploadResult update(User user, MultipartFile file) {
        String url = avatarFileService.saveFile(file);
        if (StringUtils.isEmpty(url)) {
            return AvatarUploadResult.fail();
        }
        boolean ok = userDao.update(
            null,
            new UpdateWrapper<User>()
                .set("avatar_url", url)
                .eq("id", user.getId())) > 0;
        return new AvatarUploadResult(url);
    }
}
