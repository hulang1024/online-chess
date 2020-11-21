package io.github.hulang1024.chinesechess.user;

import io.github.hulang1024.chinesechess.http.GuestAPI;
import io.github.hulang1024.chinesechess.user.login.LoginResult;
import io.github.hulang1024.chinesechess.user.login.UserLoginParam;
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

    @GuestAPI
    @PostMapping
    public ResponseEntity<RegisterResult> register(@Validated @RequestBody UserRegisterParam param) {
        RegisterResult ret = userManager.register(param);
        return new ResponseEntity(ret, ret.getCode() == 0
            ? HttpStatus.OK
            : HttpStatus.BAD_REQUEST);
    }
}
