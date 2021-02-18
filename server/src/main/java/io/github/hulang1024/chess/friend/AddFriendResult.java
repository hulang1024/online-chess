package io.github.hulang1024.chess.friend;

import lombok.Data;

@Data
public class AddFriendResult {
    private boolean ok;
    private Boolean isMutual;

    public static AddFriendResult ok(boolean isMutual) {
        AddFriendResult result = new AddFriendResult();
        result.ok = true;
        result.isMutual = isMutual;

        return result;
    }

    public static AddFriendResult fail() {
        return new AddFriendResult();
    }
}