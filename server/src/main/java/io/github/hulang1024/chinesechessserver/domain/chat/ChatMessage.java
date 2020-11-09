package io.github.hulang1024.chinesechessserver.domain.chat;

import io.github.hulang1024.chinesechessserver.entity.User;
import lombok.Data;

@Data
public class ChatMessage {
    private User fromUser;
    private String content;
}
