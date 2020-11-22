import UserGameState from "../../online/room/UserGameState";
import ChessHost from "../../rule/chess_host";
import User from "../../user/User";

export default class UserInfoPane extends eui.Group {
    private rect = new egret.Shape();
    private lblNickname = new eui.Label();
    private lblOnline = new eui.Label();
    private user: any;

    constructor() {
        super();
        
        this.minWidth = 140;
        this.height = 20;

        this.addChild(this.rect);
        
        this.lblOnline.width = 60;
        this.lblOnline.size = 20;
        this.addChild(this.lblOnline);

        this.lblNickname.size = 20;
        this.addChild(this.lblNickname);

        this.load(null, null);
    }

    load(user: User, chessHost?: ChessHost, userGameState?: UserGameState) {
        this.user = user;
        if (user == null) {
            this.visible = false;
            return;
        } else {
            this.visible = true;
        }
        let text = '';
        text += `(${chessHost == null ? '?' : (chessHost == 1 ? '红方' : '黑方')})`;
        text += ' ' + user.nickname;
        if (userGameState) {
            this.updateOnline(userGameState.online);
            text += userGameState.readied ? '' : '  (未准备)';
        }
        this.lblNickname.text = text;
        this.setActive(false);
    }

    updateOnline(online: boolean) {
        this.lblOnline.text = online ? '' : '(离线)';
    }

    getUser() {
        return this.user;
    }

    setActive(active: boolean) {
        this.rect.graphics.clear();
        this.rect.graphics.beginFill(active ? 0x00ff00 : 0xffffff, active ? 0.5 : 0);
        this.rect.graphics.drawRoundRect(0, 0, 54, 20, 8, 8);
    }
}