package io.github.hulang1024.chess.chat.command.executors;

import io.github.hulang1024.chess.chat.Channel;
import io.github.hulang1024.chess.chat.ChannelManager;
import io.github.hulang1024.chess.chat.InfoMessage;
import io.github.hulang1024.chess.chat.Message;
import io.github.hulang1024.chess.chat.command.CommandExecutor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class RollCommandExecutor implements CommandExecutor {
    @Autowired
    private ChannelManager channelManager;
    private Random random = new Random();

    @Override
    public void execute(String[] cmdParams, Message message, Channel channel) {
        channelManager.broadcast(channel, message);

        int bound = 6;
        if (cmdParams.length == 1) {
            if (!cmdParams[0].matches("^\\d+$")) {
                return;
            }
            bound = Integer.parseInt(cmdParams[0]);
        }

        int result = random.nextInt(bound);
        String text = String.format("%s 得到了 %d 点",
            message.getSender().getNickname(), result == 0 ? 1 : result);
        channelManager.broadcast(channel, new InfoMessage(text));
    }

}