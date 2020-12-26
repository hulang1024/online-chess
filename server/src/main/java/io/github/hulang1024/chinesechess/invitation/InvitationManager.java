package io.github.hulang1024.chinesechess.invitation;

import io.github.hulang1024.chinesechess.utils.TimeUtils;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InvitationManager {
    private static Map<Long, Invitation> invitationMap = new ConcurrentHashMap<>();

    public Invitation get(long id) {
        return invitationMap.get(id);
    }

    public Collection<Invitation> getUnhandledInvitations() {
        return invitationMap.values();
    }

    public void create(Invitation invitation) {
        invitation.setId(TimeUtils.nowTimestamp());
        invitationMap.put(invitation.getId(), invitation);
    }

    public void remove(Invitation invitation) {
        invitationMap.remove(invitation.getId());
    }
}
