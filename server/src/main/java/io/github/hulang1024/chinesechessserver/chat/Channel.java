package io.github.hulang1024.chinesechessserver.chat;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.gson.Gson;

import io.github.hulang1024.chinesechessserver.service.SessionUser;
import io.github.hulang1024.chinesechessserver.database.entity.EntityUser;
import io.github.hulang1024.chinesechessserver.message.server.chat.ChatMessageMsg;
import lombok.Data;

@Data
public class Channel {
    private Long id;
    private String name;
    private ChannelType type;

    @JsonIgnore
    private static final int MAX_HISTORY = 300;
    @JsonIgnore
    private List<SessionUser> users1 = new ArrayList<>();
    @JsonIgnore
    private List<EntityUser> users = new ArrayList<>();

    @JsonIgnore
    public final ArrayBlockingQueue<Message> messages = new ArrayBlockingQueue<>(MAX_HISTORY);

    @JsonIgnore
    private static Gson gson = new Gson();


    public void joinUser(SessionUser user) {
        users1.add(user);
    }

    public void joinUser(EntityUser user) {
        users.add(user);
    }

    public void removeUser(SessionUser user) {
        users1.remove(user);
    }

    public void removeUser(EntityUser user) {
        users.remove(user);
    }

    public void addNewMessage(Message message) {
        if (this.messages.remainingCapacity() == 0) {
            this.messages.poll();
        }
        this.messages.add(message);

        this.sendMessage(message);
    }

    private void sendMessage(Message msg) {
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
        users1.forEach(user -> {
            user.getSession().sendText(msgJson);
        });
    }
}