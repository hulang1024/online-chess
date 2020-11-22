package io.github.hulang1024.chinesechess.chat.command;

import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.user.User;

public interface CommandExecutor {
    public void execute(String[] cmdParams, User sender, Channel channel);
}
