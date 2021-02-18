package io.github.hulang1024.chess.chat;

public class InfoMessage extends SystemMessage {
    public InfoMessage(String content) {
        super(content);
    }

    public InfoMessage(String content, Channel channel) {
        super(content);
        this.setChannelId(channel.getId());
    }
}