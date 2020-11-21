package io.github.hulang1024.chinesechess.spectator;

import io.github.hulang1024.chinesechess.room.Room;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;

@RestController
@RequestMapping("/spectators")
@Validated
public class SpectatorController {
    @Autowired
    private SpectatorManager spectatorManager;

    @PostMapping("/{user_id}")
    public ResponseEntity<Room> add(
        @NotNull @PathVariable("user_id") Long userId,
        @Validated @RequestBody SpectateParam param) {
        SpectateResponseData responseData = spectatorManager.spectate(userId, param);
        return new ResponseEntity(responseData, responseData.getCode() == 0
            ? HttpStatus.OK
            : HttpStatus.EXPECTATION_FAILED);
    }

    @DeleteMapping("/{user_id}")
    public ResponseEntity<Void> delete(@NotNull @PathVariable("user_id") Long userId) {
        spectatorManager.leave(userId);
        return ResponseEntity.ok().build();
    }
}
