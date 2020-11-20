package io.github.hulang1024.chinesechess.user;

public class UserUtils {
    private static final ThreadLocal<User> THREAD_LOCAL = ThreadLocal.withInitial(User::new);

    public static void set(User user) {
        if (user != null) {
            THREAD_LOCAL.set(user);
        } else {
            THREAD_LOCAL.remove();
        }
    }

    public static User get() {
        return THREAD_LOCAL.get();
    }
}
