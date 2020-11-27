package io.github.hulang1024.chinesechess.friend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;

@RestController
@RequestMapping("/users/{user_id}/friends")
public class FriendsController {
    @Autowired
    private FriendsManager friendsManager;

    @PostMapping("/{friend_user_id}")
    public void addFriend(
        @NotNull @PathVariable("user_id") Long userId,
        @NotNull @PathVariable("friend_user_id") Long friendUserId) {
        friendsManager.addFriend(userId, friendUserId);
    }

    @DeleteMapping("/{friend_user_id}")
    public void deleteFriend(
        @NotNull @PathVariable("user_id") Long userId,
        @NotNull @PathVariable("friend_user_id") Long friendUserId) {
        friendsManager.deleteFriend(userId, friendUserId);
    }
}
