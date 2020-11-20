package io.github.hulang1024.chinesechess.room;

import lombok.Data;

@Data
public class JoinRoomResult {
    /**
     * 0=成功，3=房间已满，4=已加入该房间，5=已加入其它房间，6=房间密码错误
     */
    private int code;
    private Room room;
}
