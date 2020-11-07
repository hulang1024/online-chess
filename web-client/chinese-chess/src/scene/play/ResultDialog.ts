import Dialog from "../../component/Dialog";

export default class ResultDialog extends Dialog {
    private txtResult: egret.TextField;

    constructor() {
        super();

        this.visible = false;
        this.setSize(300, 150);

        this.txtResult = new egret.TextField();
        this.txtResult.size = 24;
        this.body.addChild(this.txtResult);

        this.btnCancel.visible = false;
    }

    show(isWin: boolean) {
        this.visible = true;
        this.title = '本局结束';
        this.txtResult.text = isWin ? '你赢了！' : '你输了';
    }
}