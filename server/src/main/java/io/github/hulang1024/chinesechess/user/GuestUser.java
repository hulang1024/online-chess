package io.github.hulang1024.chinesechess.user;

public class GuestUser extends User {
    private static long id = -1;
    public GuestUser() {
        this.setId(id--);
        this.setNickname("Guest");
    }
}
