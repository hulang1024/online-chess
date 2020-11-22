package io.github.hulang1024.chinesechess.chat.command;

import io.github.hulang1024.chinesechess.chat.command.executors.RecallCommandExecutor;
import io.github.hulang1024.chinesechess.chat.command.executors.RollCommandExecutor;
import io.github.hulang1024.chinesechess.chat.command.executors.WordsNotAllowedCommandExecutor;
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
            case "recall":
                return applicationContext.getBean(RecallCommandExecutor.class);
            case "roll":
                return applicationContext.getBean(RollCommandExecutor.class);
            default:
                return null;
        }
    }
}
