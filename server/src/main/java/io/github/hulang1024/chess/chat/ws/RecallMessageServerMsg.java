package io.github.hulang1024.chess.chat.ws;

import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class RecallMessageServerMsg extends ServerMessage {
    private long channelId;
    private long messageId;

    public RecallMessageServerMsg(long channelId, long messageId) {
        super("chat.recall_message");
        this.channelId = channelId;
        this.messageId = messageId;
    }
}