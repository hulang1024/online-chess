import formatTime from "../../utils/time";
import Message from "./Message";

export default class ChatLine extends eui.Group {
    constructor(msg: Message) {
        super();
        
        let layout = new eui.HorizontalLayout();
        layout.gap = 16;
        let container = new eui.Group();
        container.layout = layout;

        let headLayout = new eui.HorizontalLayout();
        headLayout.horizontalAlign = egret.HorizontalAlign.CENTER;
        let group = new eui.Group();
        group.layout = headLayout;

        // 时间
        let txtTime = new eui.Label();
        txtTime.text = formatTime(new Date());
        txtTime.size = 16;
        group.addChild(txtTime);

        // 昵称
        let txtNickname = new eui.Label();
        txtNickname.width = 130;
        txtNickname.textColor = msg.isFromMe ? 0xcc2200 : 0xffffff;
        txtNickname.text = msg.fromUserNickname + ':';
        txtNickname.size = 18;
        txtNickname.textAlign = egret.HorizontalAlign.RIGHT;
        group.addChild(txtNickname);

        container.addChild(group);

        // 内容
        let txtContent = new eui.Label();
        txtContent.text = msg.content;
        txtContent.size = 18;
        container.addChild(txtContent);

        return container;
    }
}