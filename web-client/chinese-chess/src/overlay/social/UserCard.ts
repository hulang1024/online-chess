import SearchUserInfo from "./SearchUserInfo";

export default class UserCard extends eui.Group {
    private user: SearchUserInfo;
    public onAction: Function;

    constructor(user: SearchUserInfo) {
        super();

        this.user = user;

        this.load();
    }

    load() {
        let { user } = this;

        this.width = 220;
        this.height = 90;

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 8;
        layout.paddingRight = 8;
        layout.paddingBottom = 8;
        layout.paddingLeft = 8;
        this.layout = layout;

        let background = new egret.Shape();
        background.graphics.clear();
        let bgColor = user.isOnline ? (user.isMutual ? 0xaf52c6 : 0x5c8bd6) : 0x000000;
        background.graphics.beginFill(bgColor, 0.75);
        background.graphics.drawRoundRect(0, 0, this.width, this.height, 8, 8);
        this.addChild(background);

        let lblNickname = new eui.Label();
        lblNickname.text = user.nickname;
        lblNickname.size = 20;
        this.addChild(lblNickname);

        this.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.onAction();
        }, this);
    }
}