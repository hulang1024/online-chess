package io.github.hulang1024.chinesechess.user.thirdparty.yaoxin.api;

import io.github.hulang1024.chinesechess.http.GuestAPI;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 爻信授权回调
 */
@RestController
@RequestMapping("/oauth_callback/yao_xin/")
@GuestAPI
public class YaoXinOAuthCallbackController {
    @Autowired
    @Qualifier("yaoxin-api-access")
    private APIAccess api;

    @RequestMapping
    public ResponseEntity<Void> auth(
        @RequestParam("code") String code,
        @RequestParam("state") String state) {
        api.requestAccessToken(code);
        return ResponseEntity.ok().build();
    }
}
