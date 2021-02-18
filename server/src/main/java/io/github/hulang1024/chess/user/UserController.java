package io.github.hulang1024.chess.user;

import io.github.hulang1024.chess.http.GuestAPI;
import io.github.hulang1024.chess.http.params.PageParam;
import io.github.hulang1024.chess.http.results.PageRet;
import io.github.hulang1024.chess.http.results.Result;
import io.github.hulang1024.chess.user.avatar.AvatarService;
import io.github.hulang1024.chess.user.avatar.AvatarUploadResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.NotNull;

@RestController
@RequestMapping("/users")
@Validated
public class UserController {
    @Autowired
    private UserManager userManager;

    @GuestAPI
    @GetMapping
    public ResponseEntity<PageRet<SearchUserInfo>> searchUsers(
        @Validated SearchUserParam searchUserParam,
        @Validated PageParam pageParam) {
        return ResponseEntity.ok(userManager.searchUsers(searchUserParam, pageParam));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@NotNull @PathVariable("id") Long id) {
        User user = userManager.queryUser(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GuestAPI
    @PostMapping("/login")
    public ResponseEntity<LoginResult> login(@Validated @RequestBody UserLoginParam param) {
        LoginResult ret = userManager.login(param);
        return new ResponseEntity(ret, ret.isOk() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/logout")
    public ResponseEntity<LoginResult> logout() {
        boolean ok = userManager.logout(UserUtils.get(), true);
        return new ResponseEntity(ok ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }

    @GuestAPI
    @PostMapping
    public ResponseEntity<RegisterResult> register(@Validated @RequestBody UserRegisterParam param) {
        Result ret = userManager.register(param);
        return new ResponseEntity(ret, ret.isOk() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }

    @Autowired
    private AvatarService avatarService;

    @PostMapping("/avatar")
    public ResponseEntity<AvatarUploadResult> uploadAvatar(
        @RequestParam(name="file", required=true) MultipartFile file) {
        AvatarUploadResult result = avatarService.update(UserUtils.get(), file);
        return new ResponseEntity(result, result.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }
}