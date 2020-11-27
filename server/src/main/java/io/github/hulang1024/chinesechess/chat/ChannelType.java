package io.github.hulang1024.chinesechess.chat;

public enum ChannelType {
    /**
     * 公开
     */
    PUBLIC(1),

    /**
     * 房间
     */
    ROOM(2),

    /**
     * 私信
     */
    PM(3);

    int code;

    ChannelType(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    public static ChannelType from(int code) {
        for (ChannelType type : ChannelType.values()) {
            if (code == type.getCode()) {
                return type;
            }
        }
        return null;
    }
}
