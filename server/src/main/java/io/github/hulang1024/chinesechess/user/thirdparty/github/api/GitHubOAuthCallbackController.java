package io.github.hulang1024.chinesechess.user.thirdparty.github.api;

import io.github.hulang1024.chinesechess.http.AuthenticationUtils;
import io.github.hulang1024.chinesechess.http.GuestAPI;
import io.github.hulang1024.chinesechess.user.LoginResult;
import io.github.hulang1024.chinesechess.user.thirdparty.ThirdpartyUserLoginService;
import io.github.hulang1024.chinesechess.user.thirdparty.github.api.requests.GetUserRequest;
import io.github.hulang1024.chinesechess.user.thirdparty.github.api.responses.GitHubUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * GitHub授权回调
 */
@GuestAPI
@Controller
@RequestMapping("/oauth_callback/github")
public class GitHubOAuthCallbackController {
    @Autowired
    @Qualifier("github-api-access")
    private APIAccess api;

    @Value("${app-url}")
    private String appUrl;

    @Autowired
    private ThirdpartyUserLoginService thirdpartyUserLoginService;


    @RequestMapping
    public void auth(@RequestParam("code") String code, HttpServletResponse response) {
        try {
            api.requestAccessTokenAsync(code);

            if (api.accessToken == null) {
                response.sendRedirect(appUrl + "#status=1");
                return;
            }

            GetUserRequest req = new GetUserRequest();
            req.onSuccess = (GitHubUser githubUser) -> {
                LoginResult result = thirdpartyUserLoginService.login(githubUser);
                try {
                    response.sendRedirect(appUrl
                        + "#status=0&token=" + AuthenticationUtils.generateAccessToken(result.getUser().getId()).getAccessToken());
                } catch (Exception e) { e.printStackTrace(); }
            };
            req.onExceptionFailure = (IOException e) -> {
                try {
                    response.sendRedirect(appUrl + "#status=1");
                } catch (Exception e1) { e1.printStackTrace(); }
            };
            api.performAsync(req);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
