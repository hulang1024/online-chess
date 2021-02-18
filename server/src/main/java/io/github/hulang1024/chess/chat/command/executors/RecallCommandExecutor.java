package io.github.hulang1024.chess.chat.command.executors;

import io.github.hulang1024.chess.chat.Channel;
import io.github.hulang1024.chess.chat.Message;
import io.github.hulang1024.chess.chat.command.CommandExecutor;
import io.github.hulang1024.chess.chat.ws.RecallMessageServerMsg;
import io.github.hulang1024.chess.ws.WSMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RecallCommandExecutor implements CommandExecutor {
    @Autowired
    private WSMessageService wsMessageService;

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
            wsMessageService.send(new RecallMessageServerMsg(channel.getId(), messageId), user);
        });

    }

}