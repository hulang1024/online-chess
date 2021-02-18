package io.github.hulang1024.chess.invitation;

import io.github.hulang1024.chess.http.results.Result;
import lombok.Data;

@Data
public class InviteResult extends Result {

    public InviteResult(int code) {
        super(code);
    }

    public static InviteResult ok() {
        return new InviteResult(0);
    }

    /**
     * @param code 1=邀请失败，2=被邀请用户不在线，3=邀请者必须先加入房间，4=邀请者必须先加入/观看房间
     * @return
     */
    public static InviteResult fail(int code) {
        assert code != 0;
        return new InviteResult(code);
    }
}