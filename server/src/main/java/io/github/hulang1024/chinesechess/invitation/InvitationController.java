package io.github.hulang1024.chinesechess.invitation;

import io.github.hulang1024.chinesechess.user.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;

@RestController
@RequestMapping("/invitations")
@Validated
public class InvitationController {
    @Autowired
    private InvitationService invitationService;

    @PostMapping("/{subject}")
    public ResponseEntity<InviteResult> create(
        @Validated @RequestBody Invitation invitation,
        @Validated @NotNull @PathVariable("subject") int subject) {
        invitation.setInviter(UserUtils.get());
        invitation.setSubject(subject == 1 ? Invitation.SUBJECT.PLAY : Invitation.SUBJECT.SPECTATE);
        InviteResult result = invitationService.invite(invitation);
        return result.isOk() ? ResponseEntity.ok().build() : ResponseEntity.badRequest().body(result);
    }

    @PostMapping("/reply")
    public ResponseEntity<ReplyResult> reply(@Validated @RequestBody Reply reply) {
        reply.setInvitee(UserUtils.get());
        ReplyResult result = invitationService.handleReply(reply);
        return new ResponseEntity<>(result, result.isOk() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }
}
