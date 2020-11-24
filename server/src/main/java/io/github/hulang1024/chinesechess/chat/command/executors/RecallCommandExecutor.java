package io.github.hulang1024.chinesechess.chat.command.executors;

import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.chat.Message;
import io.github.hulang1024.chinesechess.chat.command.CommandExecutor;
import io.github.hulang1024.chinesechess.user.UserSessionManager;
import io.github.hulang1024.chinesechess.ws.message.MessageUtils;
import io.github.hulang1024.chinesechess.chat.ws.RecallMessageServerMsg;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RecallCommandExecutor implements CommandExecutor {
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private UserSessionManager userSessionManager;

    @Override
    public void execute(String[] cmdParams, Message message, Channel channel) {
        if (!message.getSender().isAdmin()) {
            return;
        }
        if (cmdParams.length != 1) {
            return;
        }

        Long messageId;
        if (cmdParams[0].matches("^\\d$")) {
            messageId = Long.parseLong(cmdParams[0]);
        } else if (cmdParams[0].matches("^last$")) {
            messageId = channel.getLastMessageId();
        } else {
            return;
        }

        boolean removed = channel.removeMessage(messageId);

        if (!removed) {
            return;
        }

        channel.getUsers().forEach(user -> {
            MessageUtils.send(
                new RecallMessageServerMsg(channel.getId(), messageId),
                userSessionManager.getSession(user));
        });

    }

}
