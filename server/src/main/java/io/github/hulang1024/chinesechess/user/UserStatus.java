package io.github.hulang1024.chinesechess.user;

public enum UserStatus {
    OFFLINE(0),
    ONLINE(1),
    AFK(2),
    IN_LOBBY(3),
    IN_ROOM(4),
    PLAYING(5),
    SPECTATING(6);

    int code;
    UserStatus(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
