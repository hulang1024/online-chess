package io.github.hulang1024.chinesechess.user;

public enum UserActivity {
    LOBBY(1),
    ONLINE_USER(2),
    ROOM(3);

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
