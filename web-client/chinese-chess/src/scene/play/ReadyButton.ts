export default class ReadyButton extends eui.Button {
    private state: number = 0;//0=未准备，1=已准备，3=开始

    constructor(state: number) {
        super();
        this.width = 110;
        this.height = 50;
        this.state = state;
        this.update();
    }

    public setState(state: number) {
        this.state = state;
        this.update();
    }

    private update() {
        this.label = {0: '准备!', 1: '取消准备', 3: '开始!'}[this.state];
    }
}