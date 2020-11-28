import ChessHost from "../../rule/chess_host";
import User from "../../user/User";
import Bindable from "../../utils/bindables/Bindable";
import BindableBool from "../../utils/bindables/BindableBool";

export default class UserInfoPane extends eui.Group {
    private rect = new egret.Shape();
    private lblNickname = new eui.Label();
    private lblChessHost = new eui.Label();
    private lblOnline = new eui.Label();
    private chessHost: Bindable<ChessHost>;

    constructor(
        user: Bindable<User>, online: BindableBool, readied: BindableBool,
        chessHost: Bindable<ChessHost>, activeChessHost: Bindable<ChessHost>) {
        super();

        this.chessHost = chessHost;

        user.addAndRunOnce(this.onUserChange, this);
        online.addAndRunOnce(this.onOnlineChange, this);
        readied.addAndRunOnce(this.onReadyChange, this);
        chessHost.addAndRunOnce(this.onChessHostChange, this);
        activeChessHost.addAndRunOnce(this.onActiveChessHostChange, this);
        
        this.layout = new eui.HorizontalLayout();

        this.minWidth = 200;
        this.height = 20;

        this.addChild(this.rect);
        
        this.lblChessHost.size = 20;
        this.addChild(this.lblChessHost);

        this.lblNickname.size = 20;
        this.addChild(this.lblNickname);

        this.lblOnline.size = 20;
        this.addChild(this.lblOnline);
    }

    private onUserChange(user: User) {
        if (user == null) {
            this.visible = false;
            return;
        }

        this.visible = true;
        
        this.lblNickname.text = user.nickname;
    }

    private onReadyChange() {

    }

    private onChessHostChange(chessHost: ChessHost) {
        this.lblChessHost.text = `(${chessHost == null
            ? '?'
            : (chessHost == ChessHost.RED ? '红方' : '黑方')})`;
    }

    private onActiveChessHostChange(activeChessHost: ChessHost) {
        let isActive = this.chessHost.value == activeChessHost;

        this.rect.graphics.clear();
        this.rect.graphics.beginFill(isActive ? 0x00ff00 : 0xffffff, isActive ? 0.5 : 0);
        this.rect.graphics.drawRoundRect(0, 0, 54, 20, 8, 8);
    }

    private onOnlineChange(online: boolean) {
        this.lblOnline.text = online ? '' : '(离线)';
    }
}