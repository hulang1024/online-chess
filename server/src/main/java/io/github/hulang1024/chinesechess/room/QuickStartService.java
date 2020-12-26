package io.github.hulang1024.chinesechess.room;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class QuickStartService {
    @Autowired
    private RoomManager roomManager;

    public Room quickStart() {
        User user = UserUtils.get();

        SearchRoomParam searchRoomParam = new SearchRoomParam();
        searchRoomParam.setStatus(RoomStatus.OPEN.code);
        searchRoomParam.setRequirePassword(false);
        Optional<Room> roomOpt = roomManager.searchRooms(searchRoomParam).stream().findAny();
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            // 加入房间
            JoinRoomResult joinRoomResult = roomManager.joinRoom(room, user, null);
            if (joinRoomResult.isOk()) {
                return room;
            } else {
                return null;
            }
        }

        // 匹配失败
        return null;
    }
}
