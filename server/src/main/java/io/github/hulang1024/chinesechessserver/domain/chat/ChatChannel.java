package io.github.hulang1024.chinesechessserver.domain.chat;

import java.util.ArrayList;
import java.util.List;

import com.google.gson.Gson;

import io.github.hulang1024.chinesechessserver.domain.SessionUser;
import io.github.hulang1024.chinesechessserver.message.server.chat.ChatMessageMsg;

public class ChatChannel {
    private static Gson gson = new Gson();

    private long id;
    private List<SessionUser> users = new ArrayList<>();

    public ChatChannel(long id) {
        this.id = id;
    }

    public long getId() {
        return id;
    }

    public void joinUser(SessionUser user) {
        users.add(user);
    }

    public void removeUser(SessionUser user) {
        users.remove(user);
    }

    public void sendMessage(ChatMessage msg) {
        ChatMessageMsg msgMsg = new ChatMessageMsg();
        msgMsg.setChannelId(id);
        ChatMessageMsg.Sender sender = new ChatMessageMsg.Sender();
        sender.setId(msg.getFromUser().getId());
        sender.setNickname(msg.getFromUser().getNickname());
        msgMsg.setSender(sender);
        msgMsg.setContent(msg.getContent());
        String msgJson = gson.toJson(msgMsg);
        users.forEach(user -> {
            user.getSession().sendText(msgJson);
        });
    }
}