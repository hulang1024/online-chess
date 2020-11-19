package io.github.hulang1024.chinesechessserver.listener;

import io.github.hulang1024.chinesechessserver.service.SessionUser;
import io.github.hulang1024.chinesechessserver.chat.Channel;
import io.github.hulang1024.chinesechessserver.chat.Message;
import io.github.hulang1024.chinesechessserver.message.client.chat.ChatClientMessage;
import io.github.hulang1024.chinesechessserver.message.client.chat.FetchMessage;
import io.github.hulang1024.chinesechessserver.message.server.chat.FetchMessagesResponse;
import io.github.hulang1024.chinesechessserver.chat.ChannelManager;
import io.github.hulang1024.chinesechessserver.service.UserSessionService;
import io.github.hulang1024.chinesechessserver.utils.TimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ChatMessageListener extends MessageListener {
    private UserSessionService userSessionService = new UserSessionService();
    @Autowired
    private ChannelManager channelManager;

    @Override
    public void init() {
        addMessageHandler(ChatClientMessage.class, this::onChatMessage);
        addMessageHandler(FetchMessage.class, this::onFetchMessage);
    }

    private void onChatMessage(ChatClientMessage msg) {
        SessionUser fromUser = userSessionService.getUserBySession(msg.getSession());
        Channel channel = channelManager.getChannelById(msg.getChannelId());
        Message chatMsg = new Message();
        chatMsg.setChannelId(channel.getId());
        chatMsg.setTimestamp(TimeUtils.nowTimestamp());
        chatMsg.setSender(fromUser.getUser());
        chatMsg.setContent(msg.getContent());
        channel.addNewMessage(chatMsg);
    }

    private void onFetchMessage(FetchMessage msg) {
        Channel channel = channelManager.getChannelById(msg.getChannelId());
        
        FetchMessagesResponse response = new FetchMessagesResponse();
        response.setMsgs(channel.messages.toArray(new Message[0]));
        send(response, msg.getSession());
    }
}
