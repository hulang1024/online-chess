package io.github.hulang1024.chinesechess.chat;

import com.alibaba.fastjson.annotation.JSONField;
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

    @JSONField(serialize = false)
    private static final int MAX_HISTORY = 300;

    @JSONField(serialize = false)
    private List<User> users = new ArrayList<>();

    @JSONField(serialize = false)
    public final ArrayBlockingQueue<Message> messages = new ArrayBlockingQueue<>(MAX_HISTORY);


    public void joinUser(User user) {
        if (!users.contains(user)) {
            users.add(user);
        }
    }

    public void addNewMessage(Message message) {
        if (this.messages.remainingCapacity() == 0) {
            this.messages.poll();
        }
        this.messages.add(message);
    }

    public void removeUser(User user) {
        users.remove(user);
    }
}