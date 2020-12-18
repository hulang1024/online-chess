package io.github.hulang1024.chinesechess.user.activity;

public enum UserActivity {
    AFK(0),
    IN_LOBBY(1),
    VIEW_ONLINE_USER(2),
    IN_ROOM(3),
    PLAYING(4),
    SPECTATING(5);

    int code;

    UserActivity(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    public static UserActivity from(int code) {
        for (UserActivity item : UserActivity.values()) {
            if (code == item.getCode()) {
                return item;
            }
        }
        return null;
    }
}
