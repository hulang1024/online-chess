package io.github.hulang1024.chess.chat.command;

import io.github.hulang1024.chess.chat.Channel;
import io.github.hulang1024.chess.chat.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CommandService {
    @Autowired
    private CommandExecutorFactory commandExecutorFactory;

    public void execute(Message message, Channel channel) {
        String[] tokens = message.getContent().substring(1).split("\\s+");
        String command = tokens[0].trim();
        String[] commandParams = new String[tokens.length - 1];
        for (int i = 0; i < commandParams.length; i++) {
            commandParams[i] = tokens[i + 1].trim();
        }
        CommandExecutor commandExecutor = commandExecutorFactory.create(command);
        commandExecutor.execute(commandParams, message, channel);
    }
}