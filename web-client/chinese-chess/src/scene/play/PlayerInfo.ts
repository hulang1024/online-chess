import RoomPlayer from "../lobby/RoomPlayer";

export default class PlayerInfo extends eui.Group {
    private rect = new egret.Shape();
    private txtNickname = new egret.TextField();
    private isOther: boolean;

    constructor(isOther: boolean) {
        super();
        this.isOther = isOther;
        
        this.height = 30;

        this.addChild(this.rect);

        this.txtNickname.y = 8;
        this.txtNickname.size = 20;
        this.addChild(this.txtNickname);
        this.load(null);
    }

    load(player: RoomPlayer) {
        this.txtNickname.text = player == null
            ? '等待玩家加入'
            : (this.isOther ? "对方: " : "") + player.nickname;
        this.setActive(false);
    }

    setActive(active: boolean) {
        this.rect.graphics.clear();
        this.rect.graphics.beginFill(active ? 0x00ff00 : 0xffffff, active ? 0.5 : 0);
        this.rect.graphics.drawRoundRect(0, 0, 50, 32, 8, 8);
    }
}