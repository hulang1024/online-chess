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

        this.width = 240;
        this.height = 84;

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 8;
        layout.paddingRight = 8;
        layout.paddingBottom = 8;
        layout.paddingLeft = 8;
        this.layout = layout;

        let background = new egret.Shape();
        background.graphics.clear();
        let bgColor = user.isOnline ? (user.isMutual ? 0xaf52c6 : 0xb3d944) : 0x0;
        background.graphics.beginFill(bgColor, 0.8);
        background.graphics.drawRoundRect(0, 0, this.width, this.height, 8, 8);
        background.filters = [
            new egret.DropShadowFilter(
                2, 45, 0x000000, 0.1, 10, 10, 2,
                egret.BitmapFilterQuality.LOW, false, false)
        ];
        this.addChild(background);

        let lblNickname = new eui.Label();
        lblNickname.text = user.nickname;
        lblNickname.size = 22;
        this.addChild(lblNickname);

        const { playCount, winCount, loseCount, drawCount } = user.userStats;
        const winRate = (playCount ? winCount / playCount * 100 : 100).toFixed(2);

        let lblWinRate = new eui.Label();
        lblWinRate.text = `胜率: ${playCount ? winRate + '%' : '-'}`;
        lblWinRate.size = 16;
        this.addChild(lblWinRate);

        let group2 = new eui.Group();
        group2.layout = new eui.HorizontalLayout();
        this.addChild(group2);
        let lblPlayCount = new eui.Label();
        
        let partText = [[winCount, '胜'], [loseCount, '负'], [drawCount, '和']]
            .map(p => p.join('')).join('/');
        lblPlayCount.text = `局数: ${user.userStats.playCount}`
            + (playCount ? `  ( ${partText} )` : '');
        lblPlayCount.size = 16;
        group2.addChild(lblPlayCount);

        this.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.onAction();
        }, this);
    }
}