package io.github.hulang1024.chinesechess.chat;

import lombok.Data;

@Data
public class CreateNewPMRet {
    private boolean success;
    private Long channelId;

    public CreateNewPMRet(boolean success, Long channelId) {
        this.success = success;
        this.channelId = channelId;
    }

    public static CreateNewPMRet fail() {
        return new CreateNewPMRet(false,null);
    }
}
