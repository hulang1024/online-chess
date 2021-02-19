package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class PlayConfirmResponseServerMsg extends ServerMessage {
    private int reqType;
    private long uid;
    private boolean ok;

    public PlayConfirmResponseServerMsg(User user) {
        super("play.confirm_response");
        this.uid = user.getId();
    }
}