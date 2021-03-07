package io.github.hulang1024.chess.user;

import lombok.Data;

@Data
public class UserDeviceInfo {
    /**
     * 1=pc, 2=mobile
     */
    private Integer device;
    private String deviceOS;

    public static final UserDeviceInfo NULL = new UserDeviceInfo();
}