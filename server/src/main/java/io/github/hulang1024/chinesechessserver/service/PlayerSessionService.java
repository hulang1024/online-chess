package io.github.hulang1024.chinesechessserver.service;

import java.util.HashMap;
import java.util.Map;

import org.yeauty.pojo.Session;

import io.github.hulang1024.chinesechessserver.domain.Player;
import io.netty.channel.ChannelId;

public class PlayerSessionService {
    private static Map<ChannelId, Player> sessionPlayerMap = new HashMap<>();

    public void login(Session session) {
        if (sessionPlayerMap.get(session.id()) != null) {
            return;
        }
        Player player = new Player();
        sessionPlayerMap.put(session.id(), player);
        player.setSession(session);
        player.setNickname(player.getId() + "");
    }

    public Player getPlayer(Session session) {
        return sessionPlayerMap.get(session.id());
    }
}
