package io.github.hulang1024.chess.chat.command.executors;

import io.github.hulang1024.chess.chat.Channel;
import io.github.hulang1024.chess.chat.ChannelManager;
import io.github.hulang1024.chess.chat.InfoMessage;
import io.github.hulang1024.chess.chat.Message;
import io.github.hulang1024.chess.chat.command.CommandExecutor;
import io.github.hulang1024.chess.chat.ws.ClientCommandServerMsg;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.user.UserManager;
import io.github.hulang1024.chess.user.UserSessionManager;
import io.github.hulang1024.chess.utils.RegExStrings;
import io.github.hulang1024.chess.ws.WSMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ClientCommandExecutor implements CommandExecutor {
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private UserManager userManager;
    @Autowired
    private UserSessionManager userSessionManager;
    @Autowired
    private WSMessageService wsMessageService;

    @Override
    public void execute(String[] cmdParams, Message message, Channel channel) {
        if (!message.getSender().isAdmin()) {
            return;
        }

        if (!(cmdParams.length == 2 && cmdParams[0].matches(RegExStrings.USER_ID))) {
            return;
        }

        Long userId = Long.parseLong(cmdParams[0]);
        User user = userManager.getLoggedInUser(userId);
        if (user == null) {
            channelManager.sendSystemMessageToUser(
                new InfoMessage(String.format("%s 未登录",
                    user != null ? user.getNickname() : userId), channel),
                message.getSender());
            return;
        }

        String command = cmdParams[1];
        wsMessageService.send(new ClientCommandServerMsg(command), user);
        channelManager.sendSystemMessageToUser(
            new InfoMessage(String.format("已发送命令[%s]到 %s 当前登录的客户端",
                command, user.getNickname()), channel),
            message.getSender());
    }
}