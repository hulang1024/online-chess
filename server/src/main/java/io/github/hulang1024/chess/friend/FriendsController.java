package io.github.hulang1024.chess.friend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;

@RestController
@RequestMapping("/users/{user_id}/friends")
public class FriendsController {
    @Autowired
    private FriendsManager friendsManager;

    @PostMapping("/{friend_user_id}")
    public ResponseEntity<AddFriendResult> addFriend(
        @NotNull @PathVariable("user_id") Long userId,
        @NotNull @PathVariable("friend_user_id") Long friendUserId) {
        AddFriendResult result = friendsManager.addFriend(userId, friendUserId);
        return new ResponseEntity(result, result.isOk() ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping("/{friend_user_id}")
    public void deleteFriend(
        @NotNull @PathVariable("user_id") Long userId,
        @NotNull @PathVariable("friend_user_id") Long friendUserId) {
        friendsManager.deleteFriend(userId, friendUserId);
    }
}