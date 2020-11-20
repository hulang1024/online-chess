package io.github.hulang1024.chinesechess.utils;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

public class TimeUtils {
    public static long nowTimestamp() {
        return LocalDateTime.now().toInstant(ZoneOffset.of("+8")).toEpochMilli();
    }
}