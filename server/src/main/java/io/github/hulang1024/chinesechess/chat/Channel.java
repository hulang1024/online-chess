package io.github.hulang1024.chinesechess.chat;

import com.alibaba.fastjson.annotation.JSONField;
import io.github.hulang1024.chinesechess.user.User;
import lombok.Data;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.stream.Collectors;

@Data
public class Channel {
    private Long id;
    private String name;

    @JSONField(serialize = false)
    private ChannelType type;

    public static final int MAX_HISTORY = 300;

    @JSONField(serialize = false)
    private List<User> users = new ArrayList<>();

    @JSONField(serialize = false)
    private final ArrayBlockingQueue<Message> messages = new ArrayBlockingQueue<>(MAX_HISTORY);


    public boolean joinUser(User user) {
        if (!users.contains(user)) {
            return users.add(user);
        } else {
            return false;
        }
    }

    public void addNewMessage(Message message) {
        if (this.messages.remainingCapacity() == 0) {
            this.messages.poll();
        }
        this.messages.add(message);
    }

    public Long getLastMessageId() {
        Message lastMessage = this.messages.peek();
        return lastMessage == null ? null : lastMessage.getId();
    }

    public boolean removeMessage(Long messageId) {
        if (messageId == null) {
            return false;
        }
        return messages.removeIf(m -> m.getId() == messageId);
    }

    public void removeMessages(Collection<Message> messages) {
        this.messages.removeAll(messages);
    }

    public boolean removeUser(User user) {
        return users.remove(user);
    }


    @JSONField(name = "type")
    public int getTypeCode() {
        return type.getCode();
    }

    @JSONField(name = "users")
    public List<Long> getUserIds() {
        if (type == ChannelType.PUBLIC) {
            return new ArrayList<>();
        } else {
            return this.users.stream().map(u -> u.getId()).collect(Collectors.toList());
        }
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof Channel)) {
            return false;
        }
        return this.id.equals(((Channel) other).getId());
    }
}