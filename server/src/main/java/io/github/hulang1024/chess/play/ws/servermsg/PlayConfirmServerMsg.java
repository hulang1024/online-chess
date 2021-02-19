package io.github.hulang1024.chess.play.ws.servermsg;

import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class PlayConfirmServerMsg extends ServerMessage {
    private int reqType;
    private long uid;

    public PlayConfirmServerMsg(User user) {
        super("play.confirm_request");
        this.uid = user.getId();
    }
}