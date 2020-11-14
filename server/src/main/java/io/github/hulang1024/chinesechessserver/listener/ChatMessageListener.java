package io.github.hulang1024.chinesechessserver.listener;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import io.github.hulang1024.chinesechessserver.domain.SessionUser;
import io.github.hulang1024.chinesechessserver.domain.chat.ChatChannel;
import io.github.hulang1024.chinesechessserver.domain.chat.ChatMessage;
import io.github.hulang1024.chinesechessserver.message.client.chat.ChatClientMessage;
import io.github.hulang1024.chinesechessserver.message.client.chat.FetchMessage;
import io.github.hulang1024.chinesechessserver.message.server.chat.FetchMessagesResponse;
import io.github.hulang1024.chinesechessserver.service.ChatChannelManager;
import io.github.hulang1024.chinesechessserver.service.UserSessionService;
import io.github.hulang1024.chinesechessserver.utils.TimeUtils;

public class ChatMessageListener extends MessageListener {
    private UserSessionService userSessionService = new UserSessionService();

    @Override
    public void init() {
        addMessageHandler(ChatClientMessage.class, this::onChatMessage);
        addMessageHandler(FetchMessage.class, this::onFetchMessage);
    }

    private void onChatMessage(ChatClientMessage msg) {
        SessionUser fromUser = userSessionService.getUserBySession(msg.getSession());
        ChatChannel channel = ChatChannelManager.getChannelById(msg.getChannelId());
        ChatMessage chatMsg = new ChatMessage();
        chatMsg.setChannelId(channel.getId());
        chatMsg.setTimestamp(TimeUtils.nowTimestamp());
        chatMsg.setSender(fromUser.getUser());
        chatMsg.setContent(msg.getContent());
        channel.addNewMessage(chatMsg);
    }

    private void onFetchMessage(FetchMessage msg) {
        ChatChannel channel = ChatChannelManager.getChannelById(msg.getChannelId());
        
        FetchMessagesResponse response = new FetchMessagesResponse();
        response.setMsgs(channel.messages.toArray(new ChatMessage[0]));
        send(response, msg.getSession());
    }
}
