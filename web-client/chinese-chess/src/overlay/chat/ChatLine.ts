import Message from "../../online/chat/Message";

export default class ChatLine extends eui.Group {
    public static NICKNAME_PADDING = 222;

    constructor(msg: Message) {
        super();
        
        let layout = new eui.HorizontalLayout();
        layout.gap = 18;
        let container = new eui.Group();
        container.layout = layout;

        let headLayout = new eui.HorizontalLayout();
        headLayout.horizontalAlign = egret.HorizontalAlign.CENTER;
        let group = new eui.Group();
        group.layout = headLayout;

        // 时间
        let txtTime = new eui.Label();
        txtTime.text = this.formatTime(msg.timestamp);
        txtTime.size = 18;
        group.addChild(txtTime);

        // 昵称
        let txtNickname = new eui.Label();
        txtNickname.width = 130;
        txtNickname.textColor = ChatLine.USERNAME_COLORS[msg.sender.id % ChatLine.USERNAME_COLORS.length];
        txtNickname.text = msg.sender.nickname + ':';
        txtNickname.size = 20;
        txtNickname.italic = true;
        txtNickname.textAlign = egret.HorizontalAlign.RIGHT;
        group.addChild(txtNickname);

        container.addChild(group);

        // 内容
        let txtContent = new eui.Label();
        txtContent.text = msg.content;
        txtContent.size = 20;
        container.addChild(txtContent);

        this.addChild(container);
    }

    private formatTime(timestamp: number) {
        let time = new Date(timestamp);
        const pad = (n: number) => n > 9 ? n : '0' + n;
        return `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
    }

    private static readonly USERNAME_COLORS = [
        0x588c7e,
        0xb2a367,
        0xc98f65,
        0xbc5151,
        0x5c8bd6,
        0x7f6ab7,
        0xa368ad,
        0xaa6880,

        0x6fad9b,
        0xf2e394,
        0xf2ae72,
        0xf98f8a,
        0x7daef4,
        0xa691f2,
        0xc894d3,
        0xd895b0,

        0x53c4a1,
        0xeace5c,
        0xea8c47,
        0xfc4f4f,
        0x3d94ea,
        0x7760ea,
        0xaf52c6,
        0xe25696,

        0x677c66,
        0x9b8732,
        0x8c5129,
        0x8c3030,
        0x1f5d91,
        0x4335a5,
        0x812a96,
        0x992861
    ];
}