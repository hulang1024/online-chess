package io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 爻信授权回调
 */
@RestController
@RequestMapping("/oauth_callback/yao_xin/")
public class OAuthCallbackController {
    @Autowired
    private APIAccess api;

    @RequestMapping("/code")
    public ResponseEntity<Void> auth(
        @RequestParam("code") String code,
        @RequestParam("state") String state) {
        api.requestAccessToken(code);
        return ResponseEntity.ok().build();
    }
}
