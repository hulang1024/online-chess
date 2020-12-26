package io.github.hulang1024.chinesechess.invitation;

import io.github.hulang1024.chinesechess.invitation.ws.InvitationReplyServerMsg;
import io.github.hulang1024.chinesechess.invitation.ws.InvitationServerMsg;
import io.github.hulang1024.chinesechess.room.JoinRoomParam;
import io.github.hulang1024.chinesechess.room.JoinRoomResult;
import io.github.hulang1024.chinesechess.room.Room;
import io.github.hulang1024.chinesechess.room.RoomManager;
import io.github.hulang1024.chinesechess.spectator.SpectateResponse;
import io.github.hulang1024.chinesechess.spectator.SpectatorManager;
import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserManager;
import io.github.hulang1024.chinesechess.ws.WSMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InvitationService {
    @Autowired
    private InvitationManager invitationManager;
    @Autowired
    private UserManager userManager;
    @Autowired
    private RoomManager roomManager;
    @Autowired
    private SpectatorManager spectatorManager;
    @Autowired
    private WSMessageService wsMessageService;

    public InviteResult invite(Invitation invitation) {
        boolean isInRoom = roomManager.getJoinedRoom(invitation.getInviter()) != null;
        switch (invitation.getSubject()) {
            case PLAY:
                if (!isInRoom) {
                    return InviteResult.fail(3);
                }
                break;
            case SPECTATE:
                boolean isSpectating = spectatorManager.getSpectatingRoom(invitation.getInviter()) != null;
                if (!(isSpectating || isInRoom)) {
                    return InviteResult.fail(4);
                }
                break;
        }
        User invitee = userManager.getLoggedInUser(invitation.getInviteeId());

        if (!userManager.isOnline(invitee)) {
            return InviteResult.fail(2);
        }

        invitationManager.create(invitation);
        invitation.setInvitee(invitee);

        wsMessageService.send(new InvitationServerMsg(invitation), invitee);
        return InviteResult.ok();
    }

    public ReplyResult handleReply(Reply reply) {
        Invitation invitation = invitationManager.get(reply.getInvitationId());
        User inviter = invitation.getInviter();

        wsMessageService.send(new InvitationReplyServerMsg(reply), inviter);
        invitationManager.remove(invitation);

        ReplyResult result = new ReplyResult(1);

        if (reply.isAccept()) {
            if (!userManager.isOnline(inviter)) {
                result.setCode(2);
            } else {
                switch (invitation.getSubject()) {
                    case PLAY:
                        onAcceptPlay(result, invitation);
                        break;
                    case SPECTATE:
                        onAcceptSpectate(result, invitation);
                        break;
                    default:
                        break;
                }
            }
        } else {
            result.setCode(0);
        }

        return result;
    }

    private void onAcceptPlay(ReplyResult result, Invitation invitation) {
        Room room = roomManager.getJoinedRoom(invitation.getInviter());
        if (room == null) {
            result.setCode(3);
            return;
        }
        if (!room.isFull()) {
            JoinRoomParam roomJoinParam = new JoinRoomParam();
            roomJoinParam.setPassword(room.getPassword());
            JoinRoomResult joinRoomResult = roomManager.joinRoom(room, invitation.getInvitee(), roomJoinParam);
            if (joinRoomResult.isOk()) {
                result.setCode(0);
                result.setPlayRoom(joinRoomResult.getRoom());
            } else {
                if (joinRoomResult.getCode() == 4 || joinRoomResult.getCode() == 5) {
                    // 被邀请者在游戏中，仅仅作回复
                    result.setCode(0);
                } else {
                    result.setCode(4);
                }
            }
        }
    }

    private void onAcceptSpectate(ReplyResult result, Invitation invitation) {
        SpectateResponse spectateResponse = spectatorManager.spectateUser(
            invitation.getInviter().getId(), invitation.getInvitee().getId());
        if (spectateResponse.isOk()) {
            result.setCode(0);
            result.setSpectateResponse(spectateResponse);
        } else {
            if (spectateResponse.getCode() == 5) {
                result.setCode(5);
            } else {
                result.setCode(1);
            }
        }
    }
}
