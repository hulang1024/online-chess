package io.github.hulang1024.chinesechessserver.listener;

import io.github.hulang1024.chinesechessserver.domain.SessionUser;
import io.github.hulang1024.chinesechessserver.domain.chat.ChatChannel;
import io.github.hulang1024.chinesechessserver.domain.chat.ChatMessage;
import io.github.hulang1024.chinesechessserver.message.client.chat.ChatClientMessage;
import io.github.hulang1024.chinesechessserver.service.ChatChannelManager;
import io.github.hulang1024.chinesechessserver.service.UserSessionService;

public class ChatMessageListener extends MessageListener {
    private UserSessionService userSessionService = new UserSessionService();

    @Override
    public void init() {
        addMessageHandler(ChatClientMessage.class, this::onChatMessage);
    }

    private void onChatMessage(ChatClientMessage msg) {
        SessionUser fromUser = userSessionService.getUserBySession(msg.getSession());
        ChatChannel chatChannel = ChatChannelManager.getChannelById(msg.getChannelId());
        ChatMessage chatMsg = new ChatMessage();
        chatMsg.setFromUser(fromUser.getUser());
        chatMsg.setContent(msg.getContent());
        chatChannel.sendMessage(chatMsg);
    }

}
