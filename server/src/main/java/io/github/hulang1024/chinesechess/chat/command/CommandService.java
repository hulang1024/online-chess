package io.github.hulang1024.chinesechess.chat.command;

import io.github.hulang1024.chinesechess.chat.Channel;
import io.github.hulang1024.chinesechess.chat.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CommandService {
    @Autowired
    private CommandExecutorFactory commandExecutorFactory;

    public void execute(Message message, Channel channel) {
        String[] tokens = message.getContent().substring(1).split(" ");
        String command = tokens[0];
        String[] commandParams = new String[tokens.length - 1];
        System.arraycopy(tokens, 1,commandParams, 0, commandParams.length);

        CommandExecutor commandExecutor = commandExecutorFactory.create(command);
        commandExecutor.execute(commandParams, message, channel);
    }
}
