package io.github.hulang1024.chinesechessserver.message;

/**
 * 服务端消息结构
 * @author Hu Lang
 */
public class RetMessage<T> {
    private int code;
    private String msg;
    private String type;
    private T payload;

    public static <T> RetMessage<T> isOk(boolean isOk) {
        RetMessage message = new RetMessage();
        message.code = isOk ? 0 : 1;
        return message;
    }

    public static <T> RetMessage<T> ok() {
        return isOk(true);
    }

    public static <T> RetMessage<T> fail() {
        return isOk(false);
    }

    public RetMessage<T> setMsg(String msg) {
        this.msg = msg;
        return this;
    }
}

