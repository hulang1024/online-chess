package io.github.hulang1024.chess.chat.command.executors;

import io.github.hulang1024.chess.ban.BanUserManager;
import io.github.hulang1024.chess.ban.IpBanManager;
import io.github.hulang1024.chess.chat.Channel;
import io.github.hulang1024.chess.chat.ChannelManager;
import io.github.hulang1024.chess.chat.InfoMessage;
import io.github.hulang1024.chess.chat.Message;
import io.github.hulang1024.chess.chat.command.CommandExecutor;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.user.UserManager;
import io.github.hulang1024.chess.utils.RegExStrings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CancelBanCommandExecutor implements CommandExecutor {
    @Autowired
    private ChannelManager channelManager;
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
        User user = userManager.getDatabaseUser(userId);
        if (user != null) {
            banUserManager.cancel(user);
        }
        ipBanManager.cancelByUserId(userId);

        channelManager.sendSystemMessageToUser(
            new InfoMessage(String.format("%s 已被取消Ban",
                user != null ? user.getNickname() : userId), channel),
            message.getSender());
    }
}