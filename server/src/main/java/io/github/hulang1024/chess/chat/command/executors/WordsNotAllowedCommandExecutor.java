package io.github.hulang1024.chess.chat.command.executors;

import io.github.hulang1024.chess.chat.Channel;
import io.github.hulang1024.chess.chat.ChannelManager;
import io.github.hulang1024.chess.chat.InfoMessage;
import io.github.hulang1024.chess.chat.Message;
import io.github.hulang1024.chess.chat.command.CommandExecutor;
import io.github.hulang1024.chess.chat.ws.ChatWordsEnableServerMsg;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.user.UserManager;
import io.github.hulang1024.chess.utils.RegExStrings;
import io.github.hulang1024.chess.ws.WSMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WordsNotAllowedCommandExecutor implements CommandExecutor {
    @Autowired
    private ChannelManager channelManager;
    @Autowired
    private UserManager userManager;
    @Autowired
    private WSMessageService wsMessageService;

    private static Map<Long, WordsNotAllowedUser> wordsNotAllowedUsers = new ConcurrentHashMap();

    @Override
    public void execute(String[] cmdParams, Message message, Channel channel) {
        if (!message.getSender().isAdmin()) {
            return;
        }
        if (!(2 <= cmdParams.length && cmdParams.length <= 3)) {
            return;
        }

        Long userId = null;
        Boolean isOff = null;
        int minutes = 0;

        if (cmdParams[0].matches(RegExStrings.USER_ID)) {
            userId = Long.parseLong(cmdParams[0]);
        }
        if (cmdParams[1].matches("^on$|^off$")) {
            isOff = "off".equals(cmdParams[1]);
        }
        if (userId == null || isOff == null) {
            return;
        }
        if (isOff) {
            if (cmdParams.length == 3) {
                String durationExp = cmdParams[2];
                if (durationExp.matches("^\\d+[MmHhDd]$")) {
                    int duration = Integer.parseInt(durationExp.substring(0, durationExp.length() - 1));
                    String unit = durationExp.substring(durationExp.length() - 1).toLowerCase();
                    switch (unit) {
                        case "m":
                            minutes = duration;
                            break;
                        case "h":
                            minutes = duration * 60;
                            break;
                        case "d":
                            minutes = duration * 60 * 24;
                            break;
                    }
                }
            } else {
                return;
            }
        }

        User user = userManager.getLoggedInUser(userId);
        if (user == null || user.isAdmin() || minutes < 0) {
            return;
        }

        if (isOff) {
            wordsNotAllowedUsers.put(userId, new WordsNotAllowedUser(user, LocalDateTime.now(), minutes));
            channelManager.broadcast(channel,
                new InfoMessage(String.format("%s 已被禁言%s分钟!", user.getNickname(), minutes)));
            channelManager.sendSystemMessageToUser(
                new InfoMessage(String.format("你已被禁言%s分钟", minutes), channel), user);
            wsMessageService.send(new ChatWordsEnableServerMsg(false), user);
        } else {
            removeWordsNotAllowedUser(user, channel);
        }
    }

    public boolean isCanWords(User user, Channel channel) {
        WordsNotAllowedUser record = wordsNotAllowedUsers.get(user.getId());
        if (record == null) {
            return true;
        }
        boolean isTimeout = LocalDateTime.now().isAfter(record.getStartTime().plusMinutes(record.getMinutes()));
        if (isTimeout) {
            removeWordsNotAllowedUser(user, channel);
        }
        return isTimeout;
    }

    private void removeWordsNotAllowedUser(User user, Channel channel) {
        wordsNotAllowedUsers.remove(user.getId());
        if (channel != null) {
            channelManager.broadcast(channel, new InfoMessage(user.getNickname() + " 已被解除禁言"));
        }
        channelManager.sendSystemMessageToUser(
            new InfoMessage("你已被解除禁言", channel), user);
        wsMessageService.send(new ChatWordsEnableServerMsg(true), user);
    }
}