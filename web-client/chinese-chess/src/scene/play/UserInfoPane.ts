import RoomUser from "../../online/socket-message/response/RoomUser";

export default class UserInfoPane extends eui.Group {
    private rect = new egret.Shape();
    private txtNickname = new egret.TextField();
    private user: any;
    private isOther: boolean;

    constructor(isOther?: boolean) {
        super();
        
        this.isOther = isOther;

        this.minWidth = 100;
        this.height = 20;

        this.addChild(this.rect);

        this.txtNickname.size = 20;
        this.addChild(this.txtNickname);
        this.load(null);
    }

    load(user: RoomUser) {
        this.user = user;
        if (user == null) {
            this.visible = false;
            return;
        } else {
            this.visible = true;
        }
        this.txtNickname.text = `(${this.isOther ? '对方'
            : user.chessHost == null ? '?' : (user.chessHost == 1 ? '红方' : '黑方')}) ${user.nickname}`;
        this.setActive(false);
    }

    getUser() {
        return this.user;
    }

    setActive(active: boolean) {
        this.rect.graphics.clear();
        this.rect.graphics.beginFill(active ? 0x00ff00 : 0xffffff, active ? 0.5 : 0);
        this.rect.graphics.drawRoundRect(0, 0, 50, 20, 8, 8);
    }
}