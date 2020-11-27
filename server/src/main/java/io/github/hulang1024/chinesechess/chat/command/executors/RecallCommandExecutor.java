package io.github.hulang1024.chinesechess.chat.command.executors;

import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.chat.ChannelManager;
import io.github.hulang1024.chinesechess.chat.Message;
import io.github.hulang1024.chinesechess.chat.command.CommandExecutor;
import io.github.hulang1024.chinesechess.user.UserSessionManager;
import io.github.hulang1024.chinesechess.ws.message.WSMessageUtils;
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

        Long messageId;
        if (cmdParams.length == 0) {
            messageId = channel.getLastMessageId();
        } else if (cmdParams.length == 1 && cmdParams[0].matches("^\\d$")) {
            messageId = Long.parseLong(cmdParams[0]);
        } else {
            return;
        }

        boolean removed = channel.removeMessage(messageId);

        if (!removed) {
            return;
        }

        channel.getUsers().forEach(user -> {
            WSMessageUtils.send(
                new RecallMessageServerMsg(channel.getId(), messageId),
                userSessionManager.getSession(user));
        });

    }

}
