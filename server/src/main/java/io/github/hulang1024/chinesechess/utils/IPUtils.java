package io.github.hulang1024.chinesechess.utils;

import javax.servlet.http.HttpServletRequest;
import java.util.regex.Pattern;

public class IPUtils {
    private static final Pattern NORMAL_IP_PATTERN = Pattern.compile(
        "((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})(\\.((2(5[0-5]|[0-4]\\d))|[0-1]?\\d{1,2})){3}");
    public static String getIP(HttpServletRequest req) {
        String ip = req.getHeader("x-forwarded-for") == null
            ? req.getRemoteAddr()
            : req.getHeader("x-forwarded-for");
        return NORMAL_IP_PATTERN.matcher(ip).matches() ? ip : null;
    }
}