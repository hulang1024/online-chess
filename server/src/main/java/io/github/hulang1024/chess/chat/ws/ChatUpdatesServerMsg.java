package io.github.hulang1024.chess.chat.ws;

import io.github.hulang1024.chess.chat.Channel;
import io.github.hulang1024.chess.chat.Message;
import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

import java.util.List;


@Data
public class ChatUpdatesServerMsg extends ServerMessage {
    private Channel channel;
    private User sender;
    private List<Message> recentMessages;

    public ChatUpdatesServerMsg() {
        super("chat.presence");
    }
}