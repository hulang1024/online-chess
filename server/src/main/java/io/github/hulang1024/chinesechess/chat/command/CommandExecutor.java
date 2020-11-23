package io.github.hulang1024.chinesechess.chat.command;

import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.chat.Message;

public interface CommandExecutor {
    void execute(String[] cmdParams, Message message, Channel channel);
}
