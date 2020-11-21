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

        Optional<Room> roomOpt = roomManager.getRooms().stream()
            .filter(room -> room.getUserCount() < 2 && !room.isLocked()).findAny();
        if (roomOpt.isPresent()) {
            Room room = roomOpt.get();
            // 加入房间
            JoinRoomResult joinRoomResult = roomManager.join(room, user, null);
            if (joinRoomResult.getCode() == 0) {
                return room;
            } else {
                return null;
            }
        }

        // 匹配失败
        return null;
    }
}
