package io.github.hulang1024.chinesechess.room;

public enum RoomStatus {
    OPEN(1),
    BEGINNING(2),
    PLAYING(3);

    int code;
    RoomStatus(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
