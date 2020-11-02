package io.github.hulang1024.chinesechessserver.listener;

import org.springframework.util.StringUtils;

import io.github.hulang1024.chinesechessserver.domain.Player;
import io.github.hulang1024.chinesechessserver.message.client.player.PlayerNicknameSet;
import io.github.hulang1024.chinesechessserver.message.server.player.PlayerNicknameSetResult;
import io.github.hulang1024.chinesechessserver.service.PlayerSessionService;

public class PlayerMessageListener extends MessageListener {
    private PlayerSessionService playerSessionService = new PlayerSessionService();

    @Override
    public void init() {
        addMessageHandler(PlayerNicknameSet.class, this::setNickname);
    }

    public void setNickname(PlayerNicknameSet set) {
        PlayerNicknameSetResult result = new PlayerNicknameSetResult();

        if (StringUtils.isEmpty(StringUtils.trimAllWhitespace(set.getNickname()))) {
            result.setCode(1);
            send(result, set.getSession());
        }

        Player player = playerSessionService.getPlayer(set.getSession());
        player.setNickname(set.getNickname());

        result.setNickname(player.getNickname());
        send(result, set.getSession());
    }
}
