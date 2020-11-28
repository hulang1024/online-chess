import GameState from "../../online/play/GameState";
import Bindable from "../../utils/bindables/Bindable";
import BindableBool from "../../utils/bindables/BindableBool";

export default class ReadyButton extends eui.Button {
    private readied: BindableBool;
    private otherReadied: BindableBool;
    private gameState: Bindable<GameState>;

    constructor(readied: BindableBool, otherReadied: BindableBool, gameState: Bindable<GameState>) {
        super();
        this.width = 110;
        this.height = 50;
        
        this.readied = readied;
        this.otherReadied = otherReadied;
        this.gameState = gameState;
        [readied, otherReadied, gameState].forEach(bindable => {
            bindable.changed.add(this.onChanged, this);
        });
        this.onChanged();
    }

    private onChanged() {
        if (this.gameState.value == GameState.READY) {
            let readied = this.readied.value;
            let otherReadied = this.otherReadied.value;
            if (!readied && !otherReadied) {
                this.label = '准备!';
            } else if (readied && !otherReadied) {
                this.label = '取消准备';
            } else if (otherReadied) {
                this.label = '开始!';
            }
            this.visible = true;
        } else {
            this.visible = false;
        }
    }
}