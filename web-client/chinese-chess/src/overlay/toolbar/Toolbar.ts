import messager from "../../component/messager";
import Overlay from "../../component/Overlay";
import ChatOverlay from "../chat/ChatOverlay";
import UserLoginOverlay from "../user/UserLoginOverlay";

export default class Toolbar extends Overlay {
    chatOverlay: ChatOverlay;
    userLoginOverlay: UserLoginOverlay;

    constructor() {
        super(true, false);
                
        this.height = 56;

        let buttonGroupLayout = new eui.HorizontalLayout();
        buttonGroupLayout.horizontalAlign = egret.HorizontalAlign.RIGHT;
        buttonGroupLayout.paddingTop = 8;
        buttonGroupLayout.paddingRight = 8;
        buttonGroupLayout.paddingBottom = 8;
        buttonGroupLayout.paddingLeft = 8;
        let buttonGroup = new eui.Group();
        buttonGroup.layout = buttonGroupLayout;

        this.addChild(buttonGroup);

        // 聊天切换按钮
        let btnChat = new eui.Button();
        btnChat.width = 100;
        btnChat.height = 40;
        btnChat.label = "聊天";
        btnChat.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.chatOverlay.toggle();
        }, this);
        buttonGroup.addChild(btnChat);

        let btnSocial = new eui.Button();
        btnSocial.width = 100;
        btnSocial.height = 40;
        btnSocial.label = "在线用户";
        btnSocial.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            messager.info('no content', this);
        }, this);
        //buttonGroup.addChild(btnSocial);

        let btnUser = new eui.Button();
        btnUser.width = 100;
        btnUser.height = 40;
        btnUser.label = "登录";
        btnUser.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            if (!this.userLoginOverlay) {
                this.userLoginOverlay = new UserLoginOverlay();
                this.stage.addChild(this.userLoginOverlay);
            }
            this.userLoginOverlay.visible = true;
        }, this);
        //buttonGroup.addChild(btnUser);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            this.width = this.stage.stageWidth;
            buttonGroup.width = this.width;
            //this.setSize(this.width, this.height);  
        }, this);
    }
}