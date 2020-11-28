import Bindable from "./Bindable";

export default class BindableBool extends Bindable<boolean> {

    constructor(defaultValue: boolean = false) {
        super(defaultValue);
    }

    public toggle(): boolean {
        this.value = !this.value;
        return this.value;
    }
}