package io.github.hulang1024.chess.invitation.ws;

import io.github.hulang1024.chess.invitation.Reply;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class InvitationReplyServerMsg extends ServerMessage {
    private Reply reply;

    public InvitationReplyServerMsg(Reply reply) {
        super("invitation.reply");

        this.reply = reply;
    }
}