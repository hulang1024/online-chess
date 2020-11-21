package io.github.hulang1024.chinesechess.websocket.message.server.play;

import io.github.hulang1024.chinesechess.websocket.message.ServerMessage;
import lombok.Data;

@Data
public class PlayConfirmServerMsg extends ServerMessage {
    private int reqType;
    private int chessHost;
    
    public PlayConfirmServerMsg() {
        super("play.confirm_request");
    }
}
