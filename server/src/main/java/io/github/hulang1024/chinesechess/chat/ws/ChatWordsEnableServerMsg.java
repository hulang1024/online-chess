package io.github.hulang1024.chinesechess.chat.ws;

import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class ChatWordsEnableServerMsg extends ServerMessage {
    private boolean enabled;
    public ChatWordsEnableServerMsg(boolean enabled) {
        super("chat.words_enable");
        this.enabled = enabled;
    }
}