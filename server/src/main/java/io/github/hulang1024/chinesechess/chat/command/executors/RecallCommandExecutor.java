package io.github.hulang1024.chinesechess.chat.command.executors;

import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.chat.command.CommandExecutor;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserSessionManager;
import io.github.hulang1024.chinesechess.websocket.message.MessageUtils;
import io.github.hulang1024.chinesechess.websocket.message.server.chat.RecallMessageServerMsg;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RecallCommandExecutor implements CommandExecutor {
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private UserSessionManager userSessionManager;

    @Override
    public void execute(String[] cmdParams, User sender, Channel channel) {
        if (!sender.isAdmin()) {
            return;
        }
        if (cmdParams.length != 1) {
            return;
        }
        if (!cmdParams[0].matches("\\d+")) {
            return;
        }

        long messageId = Long.parseLong(cmdParams[0]);

        channel.removeMessage(messageId);

        channel.getUsers().forEach(user -> {
            MessageUtils.send(
                new RecallMessageServerMsg(channel.getId(), messageId),
                userSessionManager.getSession(user));
        });

    }

}
