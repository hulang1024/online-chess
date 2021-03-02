package io.github.hulang1024.chess.chat;

import lombok.Data;

@Data
public class CreateNewPMRet {
    private boolean success;
    private Long channelId;
    private Message message;

    public CreateNewPMRet(boolean success, Long channelId, Message message) {
        this.success = success;
        this.channelId = channelId;
        this.message = message;
    }

    public static CreateNewPMRet fail() {
        return new CreateNewPMRet(false,null, null);
    }
}