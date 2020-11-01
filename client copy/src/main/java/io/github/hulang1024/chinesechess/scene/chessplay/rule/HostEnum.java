package io.github.hulang1024.chinesechess.scene.chessplay.rule;

/**
 * 棋方
 * @author Hu Lang
 */
public enum HostEnum {
    /**
     * 先手
     */
    RED,
    /**
     * 后手
     */
    BLACK;

    public static HostEnum fromCode(int code) {
        return code == 1 ? RED : code == 2 ? BLACK : null;
    }

    public static int toCode(HostEnum host) {
        return host == BLACK ? 2 : 1;
    }
}
