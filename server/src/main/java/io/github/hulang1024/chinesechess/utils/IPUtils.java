package io.github.hulang1024.chinesechess.utils;

import javax.servlet.http.HttpServletRequest;

public class IPUtils {
    public static String getIP(HttpServletRequest req) {
        return req.getHeader("x-forwarded-for") == null
            ? req.getRemoteAddr()
            : req.getHeader("x-forwarded-for");
    }
}