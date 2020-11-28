package io.github.hulang1024.chinesechess.http;

import io.github.hulang1024.chinesechess.user.User;
import io.github.hulang1024.chinesechess.user.UserManager;
import io.github.hulang1024.chinesechess.user.UserUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
@Order(1)
public class AuthenticationWebInterceptor implements HandlerInterceptor {
    @Autowired
    private UserManager userManager;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();

        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        boolean isGuestAPI = ((HandlerMethod) handler).hasMethodAnnotation(GuestAPI.class);

        User user = AuthenticationUtils.verifyParseUserInfo(request.getHeader("Authorization"));
        if (user == null && !isGuestAPI) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return false;
        }

        if (user != null) {
            user = userManager.getLoggedInUser(user.getId());
            if ((user == null || user.getId() == null) && !isGuestAPI) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                return false;
            }

            UserUtils.set(user);
        }

        return true;
}

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserUtils.clear();
    }
}
