package io.github.hulang1024.chinesechessserver.http.controller;

import io.github.hulang1024.chinesechessserver.http.params.UserLoginParam;
import io.github.hulang1024.chinesechessserver.user.LoginResult;
import io.github.hulang1024.chinesechessserver.user.User;
import io.github.hulang1024.chinesechessserver.user.UserManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
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
    public ResponseEntity<LoginResult> login(@Validated @RequestBody UserLoginParam param, HttpServletRequest request) {
        LoginResult loginResult = userManager.login(param);
        request.getSession().setAttribute("ok", true);
        return new ResponseEntity(loginResult, loginResult.isOk() ? HttpStatus.OK : HttpStatus.SEE_OTHER);
    }

    @PostMapping
    public ResponseEntity<User> register(@Validated @RequestBody User user) {
        user = userManager.register(user);
        return ResponseEntity.ok(user);
    }
}
