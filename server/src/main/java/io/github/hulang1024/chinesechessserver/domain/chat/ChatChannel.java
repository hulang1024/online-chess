package io.github.hulang1024.chinesechessserver.domain.chat;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;

import com.google.gson.Gson;

import io.github.hulang1024.chinesechessserver.domain.SessionUser;
import io.github.hulang1024.chinesechessserver.message.server.chat.ChatMessageMsg;

public class ChatChannel {
    private static final int MAX_HISTORY = 300;
    private long id;
    private ChannelType type;
    private List<SessionUser> users = new ArrayList<>();
    public final ArrayBlockingQueue<ChatMessage> messages = new ArrayBlockingQueue<>(MAX_HISTORY);

    private static Gson gson = new Gson();

    public ChatChannel(long id, ChannelType type) {
        this.id = id;
        this.type = type;
    }

    public long getId() {
        return id;
    }
    
    public ChannelType getType() {
        return type;
    }


    public void joinUser(SessionUser user) {
        users.add(user);
    }

    public void removeUser(SessionUser user) {
        users.remove(user);
    }

    public void addNewMessage(ChatMessage message) {
        if (this.messages.remainingCapacity() == 0) {
            this.messages.poll();
        }
        this.messages.add(message);

        this.sendMessage(message);
    }

    private void sendMessage(ChatMessage msg) {
        ChatMessageMsg msgMsg = new ChatMessageMsg();
        msgMsg.setId(msg.getId());
        msgMsg.setChannelId(id);
        ChatMessageMsg.Sender sender = new ChatMessageMsg.Sender();
        sender.setId(msg.getSender().getId());
        sender.setNickname(msg.getSender().getNickname());
        msgMsg.setSender(sender);
        msgMsg.setContent(msg.getContent());
        msgMsg.setTimestamp(msg.getTimestamp());
        String msgJson = gson.toJson(msgMsg);
        users.forEach(user -> {
            user.getSession().sendText(msgJson);
        });
    }
}