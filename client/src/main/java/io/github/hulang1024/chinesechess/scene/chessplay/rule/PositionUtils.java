package io.github.hulang1024.chinesechess.scene.chessplay.rule;

public class PositionUtils {
    /**
     * 将远程对方纵坐标转换到本地纵坐标
     * @param row 对方的纵坐标
     * @return
     */
    public static int convertToLocalRow(boolean isOther, int row) {
        // 对方总是在顶部
        return isOther ? 9 - row : row;
    }
}
