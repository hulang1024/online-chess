package io.github.hulang1024.chinesechess.chat.command.executors;

import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.chat.InfoMessage;
import io.github.hulang1024.chinesechess.chat.command.CommandExecutor;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class WordsNotAllowedCommandExecutor implements CommandExecutor {
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private UserManager userManager;

    private static List<Long> wordsNotAllowedUserIds = new CopyOnWriteArrayList<>();

    @Override
    public void execute(String[] cmdParams, User sender, Channel channel) {
        if (!sender.isAdmin()) {
            return;
        }

        if (!(cmdParams.length != 2
            && cmdParams[0].matches("\\d+")
            && cmdParams[1].matches("on|off"))) {
            return;
        }

        long userId = Long.parseLong(cmdParams[0]);
        boolean notAllowed = "off".equals(cmdParams[1]);

        User user = userManager.getLoggedInUser(userId);
        if (user == null || user.isAdmin()) {
            return;
        }

        if (notAllowed) {
            if (!wordsNotAllowedUserIds.contains(userId)) {
                wordsNotAllowedUserIds.add(userId);
            }
            channelManager.broadcast(channel, new InfoMessage( user.getNickname() + " 已禁言!"));
        } else {
            if (wordsNotAllowedUserIds.contains(userId)) {
                wordsNotAllowedUserIds.remove(userId);
            }
            channelManager.broadcast(channel, new InfoMessage( user.getNickname() + " 已解除禁言"));
        }
    }

    public boolean isWordsNotAllowedUser(User user) {
        return wordsNotAllowedUserIds.contains(user.getId());
    }
}
