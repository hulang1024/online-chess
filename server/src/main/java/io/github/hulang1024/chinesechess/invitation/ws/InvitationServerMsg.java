package io.github.hulang1024.chinesechess.invitation.ws;

import io.github.hulang1024.chinesechess.invitation.Invitation;
import io.github.hulang1024.chinesechess.ws.ServerMessage;
import lombok.Data;

@Data
public class InvitationServerMsg extends ServerMessage {
    private Invitation invitation;

    public InvitationServerMsg(Invitation invitation) {
        super("invitation.new");

        this.invitation = invitation;
    }
}
