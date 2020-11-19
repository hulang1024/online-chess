package io.github.hulang1024.chinesechessserver.play.rule;

import lombok.Data;

@Data
public class ChessPos {
    public int row;
    public int col;

    public ChessPos(int row, int col) {
        this.row = row;
        this.col = col;
    }
}
