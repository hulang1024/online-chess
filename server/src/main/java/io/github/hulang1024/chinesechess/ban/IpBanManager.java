package io.github.hulang1024.chinesechess.ban;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import io.github.hulang1024.chinesechess.user.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class IpBanManager {
    @Autowired
    private IpBanDao ipBanDao;

    public boolean isBanned(String ip) {
        return ipBanDao.selectById(ip) != null;
    }

    public void add(User user, String ip) {
        IpBan ipBan = new IpBan();
        ipBan.setIp(ip);
        ipBan.setUserId(user.getId());
        ipBan.setCreateAt(LocalDateTime.now());
        ipBanDao.insert(ipBan);
    }

    public void cancelByUserId(Long userId) {
        ipBanDao.delete(new QueryWrapper<IpBan>().eq("user_id", userId));
    }
}