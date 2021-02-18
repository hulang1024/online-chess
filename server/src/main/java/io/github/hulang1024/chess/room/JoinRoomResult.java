package io.github.hulang1024.chess.room;

import io.github.hulang1024.chess.http.results.Result;
import lombok.Data;

@Data
public class JoinRoomResult extends Result {
    private Room room;

    /**
     *
     * @param code 0=成功，2=未连接，3=房间已满，4=已加入该房间，5=已加入其它房间，6=房间密码错误，7=房间不存在
     */
    private JoinRoomResult(int code) {
        super(code);
    }

    public static JoinRoomResult ok(Room room) {
        JoinRoomResult result = new JoinRoomResult(0);
        result.room = room;
        return result;
    }

    public static JoinRoomResult fail(int code) {
        return new JoinRoomResult(code);
    }
}