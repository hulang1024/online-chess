package io.github.hulang1024.chess.chat.command.executors;

import io.github.hulang1024.chess.chat.Channel;
import io.github.hulang1024.chess.chat.Message;
import io.github.hulang1024.chess.chat.command.CommandExecutor;
import io.github.hulang1024.chess.chat.ws.RecallMessageServerMsg;
import io.github.hulang1024.chess.ws.WSMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class RecallCommandExecutor implements CommandExecutor {
    @Autowired
    private WSMessageService wsMessageService;

    @Override
    public void execute(String[] cmdParams, Message cmdMessage, Channel channel) {
        Long messageId = null;
        if (cmdParams.length == 0) {
            // 如果未指定消息id参数
            if (cmdMessage.getSender().isAdmin()) {
                // 默认是最后一条
                messageId = channel.getLastMessageId();
            } else {
                // 非管理员默认是自己最后发的一条
                Message lastMessage = null;
                int total = channel.getMessages().size();
                if (total > 0) {
                    for (int index = total - 1; index < total; index--) {
                        lastMessage = channel.getMessages().get(index);
                        if (lastMessage.getSender().equals(cmdMessage.getSender())) {
                            messageId = lastMessage.getId();
                            break;
                        }
                    }
                }
            }
        } else if (cmdParams.length == 1 && cmdParams[0].matches("^-?\\d+$")) {
            messageId = Long.parseLong(cmdParams[0]);
            Optional<Message> messageToRecallOpt = channel.getMessageById(messageId);
            if (!messageToRecallOpt.isPresent()) {
                return;
            }
            // 非管理员只能撤回自己的消息
            if (!cmdMessage.getSender().isAdmin()
                && !messageToRecallOpt.get().getSender().equals(cmdMessage.getSender())) {
                return;
            }
        } else {
            return;
        }

        boolean removed = channel.removeMessage(messageId);

        if (!removed) {
            return;
        }

        final long finalMessageId = messageId;
        channel.getUsers().forEach(user -> {
            wsMessageService.send(new RecallMessageServerMsg(channel.getId(), finalMessageId), user);
        });
    }
}