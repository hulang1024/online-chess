package io.github.hulang1024.chess.task;

import io.github.hulang1024.chess.invitation.Invitation;
import io.github.hulang1024.chess.invitation.InvitationManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class InvitationTask {
    @Autowired
    private InvitationManager invitationManager;

    /**
     * 每日晚上0点清理没有处理的邀请
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void clearUnhandledInvitations() {
        for (Invitation invitation : invitationManager.getUnhandledInvitations()) {
            invitationManager.remove(invitation);
        }
    }
}