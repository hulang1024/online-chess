package io.github.hulang1024.chinesechess.scene.chessplay.rule;

public class PositionUtils {
    /**
     * 将远程对方纵坐标转换到本地纵坐标
     * @param row 对方的纵坐标
     * @return
     */
    public static int remoteRowToLocalRow(boolean isOther, int row) {
        // 对方总是在顶部
        return isOther ? 9 - row : row;
    }

    /**
     * 将远程对方横坐标转换到本地横坐标
     * @param col 对方的横坐标
     * @return
     */
    public static int remoteColToLocalCol(boolean isOther, int col) {
        // 对方总是在顶部
        return isOther ? 8 - col : col;
    }
}
