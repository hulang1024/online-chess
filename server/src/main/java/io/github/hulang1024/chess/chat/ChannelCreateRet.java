package io.github.hulang1024.chess.chat;

import lombok.Data;

import java.util.List;

@Data
public class ChannelCreateRet {
    private Long channelId;

    private List<Message> recentMessages;
}