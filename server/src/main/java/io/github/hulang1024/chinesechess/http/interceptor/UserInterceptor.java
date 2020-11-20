package io.github.hulang1024.chinesechess.http.interceptor;

import io.github.hulang1024.chinesechess.user.OnlineUserManager;
import io.github.hulang1024.chinesechess.user.UserUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
@Order(1)
public class UserInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();

        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        if (uri.startsWith("/users/login")) {
            return true;
        }

        String token = request.getHeader("token");
        if (StringUtils.isEmpty(token)) {
            response.setStatus(HttpStatus.BAD_REQUEST.value());
            return true;
        }
        UserUtils.set(OnlineUserManager.getUserById(Long.parseLong(token)));
        return true;
}

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserUtils.set(null);
    }
}
