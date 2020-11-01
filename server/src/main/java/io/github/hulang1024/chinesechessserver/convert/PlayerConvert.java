package io.github.hulang1024.chinesechessserver.convert;

import io.github.hulang1024.chinesechessserver.domain.Player;
import io.github.hulang1024.chinesechessserver.message.server.RoomPlayerInfo;

public class PlayerConvert {
    public RoomPlayerInfo toRoomPlayerInfo(Player player) {
        RoomPlayerInfo result = new RoomPlayerInfo();
        result.setId(player.getId());
        result.setNickname(player.getNickname());
        result.setNickname("" + player.getId());
        result.setReadyed(player.isReadyed());

        return result;
    }
}
