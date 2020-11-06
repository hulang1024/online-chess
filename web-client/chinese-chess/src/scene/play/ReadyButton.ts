export default class ReadyButton extends eui.Button {
    private readyed: boolean = false;

    constructor(readyed: boolean) {
        super();
        this.width = 100;
        this.height = 50;
        this.readyed = readyed;
        this.update();
    }

    public toggle() {
        this.readyed = !this.readyed;
        this.update();
    }

    private update() {
        this.label = this.readyed ? '取消准备' : '准备';;
    }
}