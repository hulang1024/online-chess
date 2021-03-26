package io.github.hulang1024.chess.chat;

import io.github.hulang1024.chess.user.User;
import lombok.Data;

import java.util.List;

@Data
public class ChannelCreateRet {
    private Long channelId;

    private User targetUser;

    private List<Message> recentMessages;
}