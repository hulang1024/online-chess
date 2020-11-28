import APIAccess from "../../online/api/APIAccess";
import SceneContext from "../../scene/SceneContext";
import User from "../../user/User";
import Overlay from "../Overlay";

export default class UserPanel extends Overlay {
    private context: SceneContext;
    private api: APIAccess;
    private lblNickname = new eui.Label();
    private lblUid = new eui.Label();
    private lblLastLoginTime = new eui.Label();
    private lblIsOnline = new eui.Label();

    constructor(context: SceneContext) {
        super(true, false);
        this.context = context;
        this.api = context.api;

        this.width = 400;
        this.height = 360;

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 32;
        layout.paddingRight = 32;
        layout.paddingBottom = 32;
        layout.paddingLeft = 32;
        layout.gap = 16;
        layout.horizontalAlign = egret.HorizontalAlign.CONTENT_JUSTIFY;

        this.layout = layout;

        this.visible = false;

        this.lblNickname.size = 20;
        this.addChild(this.lblNickname);

        this.lblUid.size = 20;
        this.addChild(this.lblUid);

        this.lblIsOnline.size = 20;
        this.addChild(this.lblIsOnline);

        this.lblLastLoginTime.size = 20;
        this.addChild(this.lblLastLoginTime);

        let btnBack = new eui.Button();
        btnBack.label = '关闭';
        btnBack.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.hide();

        }, this);
        this.addChild(btnBack);
    }

    public showUser(user: User) {
        this.lblNickname.text = '昵称: ' + user.nickname;
        this.lblUid.text = 'ID: ' + user.id;
        this.lblIsOnline.text = '在线: ' + (user.isOnline ? '是' : '离线');
        this.lblLastLoginTime.text = '最后登录时间: ' + (user.lastLoginTime || '未登录过');

        this.show();
    }
}