import RoomPlayer from "../lobby/RoomPlayer";

export default class PlayerInfo extends eui.Group {
    private rect = new egret.Shape();
    private txtNickname = new egret.TextField();
    private isOther: boolean;

    constructor(isOther: boolean) {
        super();
        this.isOther = isOther;
        
        this.height = 20;

        this.addChild(this.rect);

        this.txtNickname.size = 20;
        this.addChild(this.txtNickname);
        this.load(null);
    }

    load(player: RoomPlayer) {
        if (player == null) {
            this.visible = false;
            return;
        } else {
            this.visible = true;
        }
        this.txtNickname.text = (this.isOther ? "对方: " : "") + player.nickname;
        this.setActive(false);
    }

    setActive(active: boolean) {
        this.rect.graphics.clear();
        this.rect.graphics.beginFill(active ? 0x00ff00 : 0xffffff, active ? 0.5 : 0);
        this.rect.graphics.drawRoundRect(0, 0, 50, 20, 8, 8);
    }
}