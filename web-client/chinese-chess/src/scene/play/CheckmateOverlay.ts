import Overlay from "../../component/Overlay";
import ChessHost from "./rule/chess_host";

export default class CheckmateOverlay extends Overlay {
    private text: egret.TextField;

    constructor() {
        super();

        this.visible = false;
        this.setSize(200, 70);

        let text = new egret.TextField();
        text.size = 40;
        text.width = 200;
        text.height = 70;
        text.text = '将军!';
        text.bold = true;
        text.stroke = 2;
        text.strokeColor = 0xffffff;
        text.verticalAlign = egret.VerticalAlign.MIDDLE;
        text.textAlign = egret.HorizontalAlign.CENTER;
        this.body.addChild(text);
        this.text = text;
    }

    show(chessHost: ChessHost) {
        this.text.textColor = chessHost == ChessHost.RED ? 0x953217 : 0x2c2c2a;
        this.visible = true;
        setTimeout(() => {
            this.visible = false;
        }, 3000);
    }
}