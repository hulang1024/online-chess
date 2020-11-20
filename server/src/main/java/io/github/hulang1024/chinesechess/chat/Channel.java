package io.github.hulang1024.chinesechess.chat;

import com.alibaba.fastjson.annotation.JSONField;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.github.hulang1024.chinesechess.message.MessageUtils;
import io.github.hulang1024.chinesechess.message.server.chat.ChatMessageServerMsg;
import io.github.hulang1024.chinesechess.user.User;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;

@Data
public class Channel {
    private Long id;
    private String name;
    private ChannelType type;

    @JsonIgnore
    @JSONField(serialize = false)
    private static final int MAX_HISTORY = 300;

    @JsonIgnore
    @JSONField(serialize = false)
    private List<User> users = new ArrayList<>();

    @JsonIgnore
    @JSONField(serialize = false)
    public final ArrayBlockingQueue<Message> messages = new ArrayBlockingQueue<>(MAX_HISTORY);


    public void joinUser(User user) {
        if (!users.contains(user)) {
            users.add(user);
        }
    }

    public void removeUser(User user) {
        users.remove(user);
    }

    public void addNewAndSendMessage(Message message) {
        if (this.messages.remainingCapacity() == 0) {
            this.messages.poll();
        }
        this.messages.add(message);

        this.sendMessage(message);
    }

    private void sendMessage(Message msg) {
        ChatMessageServerMsg msgMsg = new ChatMessageServerMsg();
        msgMsg.setId(msg.getId());
        msgMsg.setChannelId(id);
        ChatMessageServerMsg.Sender sender = new ChatMessageServerMsg.Sender();
        sender.setId(msg.getSender().getId());
        sender.setNickname(msg.getSender().getNickname());
        msgMsg.setSender(sender);
        msgMsg.setContent(msg.getContent());
        msgMsg.setTimestamp(msg.getTimestamp());

        users.forEach(user -> {
            MessageUtils.send(msgMsg, user.getSession());
        });
    }
}