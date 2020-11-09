package io.github.hulang1024.chinesechessserver.convert;

import io.github.hulang1024.chinesechessserver.domain.SessionUser;
import io.github.hulang1024.chinesechessserver.message.server.room.RoomUserInfo;

public class UserConvert {
    public RoomUserInfo toRoomUserInfo(SessionUser user) {
        RoomUserInfo result = new RoomUserInfo();
        result.setId(user.getId());
        result.setNickname(user.getUser().getNickname());
        if (user.getChessHost() != null) {
            result.setChessHost(user.getChessHost().code());
        }
        result.setReadyed(user.isReadyed());

        return result;
    }
}
