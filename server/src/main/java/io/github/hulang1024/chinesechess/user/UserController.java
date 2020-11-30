package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.http.GuestAPI;
import io.github.hulang1024.chinesechess.http.params.PageParam;
import io.github.hulang1024.chinesechess.http.results.PageRet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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
        User user = userManager.getDatabaseUser(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GuestAPI
    @PostMapping("/login")
    public ResponseEntity<LoginResult> login(@Validated @RequestBody UserLoginParam param) {
        LoginResult ret = userManager.login(param);
        return new ResponseEntity(ret, ret.getCode() == 0
            ? HttpStatus.OK
            : HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/logout")
    public ResponseEntity<LoginResult> logout() {
        boolean ok = userManager.logout(UserUtils.get());
        return new ResponseEntity(ok ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
    }

    @GuestAPI
    @PostMapping
    public ResponseEntity<RegisterResult> register(@Validated @RequestBody UserRegisterParam param) {
        RegisterResult ret = userManager.register(param);
        return new ResponseEntity(ret, ret.getCode() == 0
            ? HttpStatus.OK
            : HttpStatus.BAD_REQUEST);
    }
}
