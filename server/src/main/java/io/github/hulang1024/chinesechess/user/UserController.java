package io.github.hulang1024.chinesechess.user;

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
    public ResponseEntity<User> getById(@NotNull @PathVariable("id") Long id) {
        User user = userManager.getById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResult> login(@Validated @RequestBody UserLoginParam param) {
        LoginResult loginResult = userManager.login(param);
        return new ResponseEntity(loginResult, loginResult.isOk() ? HttpStatus.OK : HttpStatus.SEE_OTHER);
    }

    @PostMapping
    public ResponseEntity<User> register(@Validated @RequestBody UserRegisterParam param) {
        User user = userManager.register(param);
        return ResponseEntity.ok(user);
    }
}
