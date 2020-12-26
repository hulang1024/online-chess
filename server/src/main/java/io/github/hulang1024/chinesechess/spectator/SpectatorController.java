package io.github.hulang1024.chinesechess.spectator;

import io.github.hulang1024.chinesechess.room.Room;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;

@RestController
@RequestMapping
@Validated
public class SpectatorController {
    @Autowired
    private SpectatorManager spectatorManager;

    @PutMapping("/rooms/{room_id}/spectators/{spectator_id}")
    public ResponseEntity<Room> spectateRoom(
        @NotNull @PathVariable("room_id") Long roomId,
        @NotNull @PathVariable("spectator_id") Long spectatorId) {
        SpectateResponse responseData = spectatorManager.spectateRoom(roomId, spectatorId);
        return new ResponseEntity(responseData, responseData.isOk()
            ? HttpStatus.OK
            : HttpStatus.EXPECTATION_FAILED);
    }

    @PutMapping("/users/{target_user_id}/spectators/{spectator_id}")
    public ResponseEntity<Room> spectateUser(
        @NotNull @PathVariable("target_user_id") Long targetUserId,
        @NotNull @PathVariable("spectator_id") Long spectatorId) {
        SpectateResponse responseData = spectatorManager.spectateUser(targetUserId, spectatorId);
        return new ResponseEntity(responseData, responseData.isOk()
            ? HttpStatus.OK
            : HttpStatus.EXPECTATION_FAILED);
    }

    @DeleteMapping("/rooms/{room_id}/spectators/{user_id}")
    public ResponseEntity<Void> delete(
        @NotNull @PathVariable("room_id") Long roomId,
        @NotNull @PathVariable("user_id") Long userId) {
        spectatorManager.leaveRoom(roomId, userId);
        return ResponseEntity.ok().build();
    }
}
