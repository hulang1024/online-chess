package io.github.hulang1024.chinesechess.play;

public enum GameState {
    /**
     * 准备开始
     */
    READY(1),

    /**
     * 对局进行中
     */
    PLAYING(2),

    /**
     * 暂停中，其中一方离线会是此状态
     */
    PAUSE(3),

    END(4);

    int code;

    GameState(int code) {
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}