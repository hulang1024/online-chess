package io.github.hulang1024.chinesechess.chat.command.executors;

import io.github.hulang1024.chinesechess.ban.BanUserManager;
import io.github.hulang1024.chinesechess.ban.IpBanManager;
import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.chat.InfoMessage;
import io.github.hulang1024.chinesechess.chat.Message;
import io.github.hulang1024.chinesechess.chat.command.CommandExecutor;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserManager;
import io.github.hulang1024.chinesechess.user.UserSessionManager;
import io.github.hulang1024.chinesechess.utils.RegExStrings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.yeauty.pojo.Session;

@Component
public class BanCommandExecutor implements CommandExecutor {
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private UserSessionManager userSessionManager;
    @Autowired
    private UserManager userManager;
    @Autowired
    private IpBanManager ipBanManager;
    @Autowired
    private BanUserManager banUserManager;

    @Override
    public void execute(String[] cmdParams, Message message, Channel channel) {
        if (!message.getSender().isAdmin()) {
            return;
        }

        if (!(cmdParams.length == 1 && cmdParams[0].matches(RegExStrings.USER_ID))) {
            return;
        }

        Long userId = Long.parseLong(cmdParams[0]);
        User user = userManager.getLoggedInUser(userId);
        if (user == null || user.isAdmin()) {
            return;
        }

        ipBanManager.add(user, user.getUserIp());
        banUserManager.add(user);

        channelManager.broadcast(channel, new InfoMessage(String.format("%s 已被Ban", user.getNickname())));

        Session session = userSessionManager.getSession(user);
        if (session != null) {
            session.close();
        }
        userManager.logout(user, true);
    }
}