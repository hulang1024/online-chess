package io.github.hulang1024.chinesechess.scene.chessplay.rule;

/**
 * 棋方
 * @author Hu Lang
 */
public enum HostEnum {
    /**
     * 先手
     */
    RED(1),
    /**
     * 后手
     */
    BLACK(2);

    private int code;

    HostEnum(int code) {
        this.code = code;
    }

    public int code() {
        return code;
    }

    public HostEnum reverse() {
        return this == BLACK ? RED : BLACK;
    }

    public static HostEnum fromCode(int code) {
        return code == 1 ? RED : code == 2 ? BLACK : null;
    }
}
