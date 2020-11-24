package io.github.hulang1024.chinesechess.utils;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;

public class TimeUtils {
    public static long nowTimestamp() {
        return toTimestamp(LocalDateTime.now());
    }

    public static long toTimestamp(LocalDateTime localDateTime) {
        return localDateTime.toInstant(ZoneOffset.of("+8")).toEpochMilli();
    }

    public static Date toDate(LocalDateTime localDateTime) {
        return Date.from(localDateTime.atZone(ZoneOffset.of("+8")).toInstant());
    }
}