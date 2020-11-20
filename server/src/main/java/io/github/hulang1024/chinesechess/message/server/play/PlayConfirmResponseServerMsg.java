package io.github.hulang1024.chinesechess.message.server.play;

import io.github.hulang1024.chinesechess.message.ServerMessage;
import lombok.Data;

@Data
public class PlayConfirmResponseServerMsg extends ServerMessage {
    private int reqType;
    private int chessHost;
    private boolean ok;

    public PlayConfirmResponseServerMsg() {
        super("play.confirm_response");
    }
}
