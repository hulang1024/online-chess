package io.github.hulang1024.chess.invitation.ws;

import io.github.hulang1024.chess.invitation.Invitation;
import io.github.hulang1024.chess.ws.ServerMessage;
import lombok.Data;

@Data
public class InvitationServerMsg extends ServerMessage {
    private Invitation invitation;

    public InvitationServerMsg(Invitation invitation) {
        super("invitation.new");

        this.invitation = invitation;
    }
}