package io.github.hulang1024.chinesechessserver.listener;

import io.github.hulang1024.chinesechessserver.domain.Player;
import io.github.hulang1024.chinesechessserver.message.client.chat.ChatClientMessage;
import io.github.hulang1024.chinesechessserver.message.server.chat.ChatMessage;
import io.github.hulang1024.chinesechessserver.service.PlayerSessionService;

public class ChatMessageListener extends MessageListener {
    private PlayerSessionService playerSessionService = new PlayerSessionService();

    @Override
    public void init() {
        addMessageHandler(ChatClientMessage.class, this::onChatMessage);
    }

    private void onChatMessage(ChatClientMessage chatClientMessage) {
        ChatMessage forwardChatMessage = new ChatMessage();
        forwardChatMessage.setContent(chatClientMessage.getContent());

        Player fromPlayer = playerSessionService.getPlayer(chatClientMessage.getSession());
        fromPlayer.getJoinedRoom().getPlayers().forEach(toPlayer -> {
            if (fromPlayer != toPlayer) {
                send(forwardChatMessage, toPlayer.getSession());
            }
        });
    }

}
