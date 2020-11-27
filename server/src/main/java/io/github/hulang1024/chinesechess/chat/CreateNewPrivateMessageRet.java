package io.github.hulang1024.chinesechess.chat;

import lombok.Data;

@Data
public class CreateNewPrivateMessageRet {
    private boolean success;
    private Long channelId;

    public CreateNewPrivateMessageRet(boolean success, Long channelId) {
        this.success = success;
        this.channelId = channelId;
    }

    public static CreateNewPrivateMessageRet fail() {
        return new CreateNewPrivateMessageRet(false,null);
    }
}
