package io.github.hulang1024.chess.chat.command;

import io.github.hulang1024.chess.chat.Channel;
import io.github.hulang1024.chess.chat.Message;

public interface CommandExecutor {
    void execute(String[] cmdParams, Message message, Channel channel);
}