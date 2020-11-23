import messager from "../../component/messager";
import Overlay from "../Overlay";
import ChatOverlay from "../chat/ChatOverlay";
import UserLoginOverlay from "../user/UserLoginOverlay";
import SceneContext from "../../scene/SceneContext";
import ToolbarUserButton from "./ToolbarUserButton";

export default class Toolbar extends Overlay {
    context: SceneContext;
    chatOverlay: ChatOverlay;
    userLoginOverlay: UserLoginOverlay;
    toolbarUserButton: ToolbarUserButton;

    constructor(context: SceneContext) {
        super(false, false);
        this.context = context;
        this.chatOverlay = context.chatOverlay;
                
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
        btnChat.label = "聊天";
        btnChat.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            this.chatOverlay.toggle();
        }, this);
        buttonGroup.addChild(btnChat);

        let btnSocial = new eui.Button();
        btnSocial.width = 100;
        btnSocial.label = "在线用户";
        btnSocial.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            messager.info('no content', this);
        }, this);
        //buttonGroup.addChild(btnSocial);

        this.toolbarUserButton = new ToolbarUserButton(context);
        this.toolbarUserButton.addEventListener(egret.TouchEvent.TOUCH_TAP, () => {
            if (!this.userLoginOverlay) {
                this.userLoginOverlay = new UserLoginOverlay(context);
                this.stage.addChild(this.userLoginOverlay);
            }
            this.userLoginOverlay.toggle();
        }, this);
        buttonGroup.addChild(this.toolbarUserButton);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            this.width = this.stage.stageWidth;
            buttonGroup.width = this.width;
        }, this);
    }
}