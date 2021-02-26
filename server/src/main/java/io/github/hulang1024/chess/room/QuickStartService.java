package io.github.hulang1024.chess.room;

import io.github.hulang1024.chess.user.User;
import io.github.hulang1024.chess.user.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.Optional;
import java.util.function.Function;

@Service
public class QuickStartService {
    @Autowired
    private RoomManager roomManager;

    public Room quickStart() {
        User user = UserUtils.get();

        SearchRoomParam searchRoomParam = new SearchRoomParam();
        searchRoomParam.setStatus(RoomStatus.OPEN.code);
        searchRoomParam.setRequirePassword(false);

        Optional<Room> roomOpt;
        if (user.getPlayGameType() == null) {
            roomOpt = roomManager.searchRooms(searchRoomParam).stream().findAny();
        } else {
            Function<Room, Integer> roomCmpValue = (room) -> {
                int gameType = room.getGameSettings().getGameType().getCode();
                return gameType == user.getPlayGameType() ? Integer.MIN_VALUE : gameType;
            };
            roomOpt = roomManager.searchRooms(searchRoomParam).stream()
                .sorted(Comparator.comparingInt(roomCmpValue::apply))
                .findAny();
        }
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