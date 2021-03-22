package io.github.hulang1024.chess.chat.command;

import io.github.hulang1024.chess.chat.command.executors.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
public class CommandExecutorFactory {
    @Autowired
    private ApplicationContext applicationContext;

    public CommandExecutor create(String name) {
        switch (name) {
            case "words":
                return applicationContext.getBean(WordsNotAllowedCommandExecutor.class);
            case "ban":
                return applicationContext.getBean(BanCommandExecutor.class);
            case "cancel-ban":
                return applicationContext.getBean(CancelBanCommandExecutor.class);
            case "logout":
                return applicationContext.getBean(LogoutCommandExecutor.class);
            case "recall":
                return applicationContext.getBean(RecallCommandExecutor.class);
            case "roll":
                return applicationContext.getBean(RollCommandExecutor.class);
            case "command":
                return applicationContext.getBean(ClientCommandExecutor.class);
            default:
                return null;
        }
    }
}