package io.github.hulang1024.chinesechess.user;

public enum UserStatus {
    OFFLINE(0),
    ONLINE(1),
    IN_ROOM(2),
    PLAYING(3),
    SPECTATING(4);

    int code;
    UserStatus(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
