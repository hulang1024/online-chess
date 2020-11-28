export default class Bindable<T> {
    /**
     * 产生一个信号，当 value 发生变化后
     */
    public readonly changed: Signal = new Signal();

    protected _value: T;
    protected readonly default: T;

    constructor(defaultValue?: T) {
        if (typeof defaultValue != 'undefined') {
            this._value = this.default = defaultValue;
        }
    }

    /**
     * 设置 changed 信号处理器，并且立即触发运行一次
     */
    public addAndRunOnce(changedHandler: Function, handlerContext: any = null) {
        this.changed.add(changedHandler, handlerContext);
        changedHandler.call(handlerContext, this._value);
    }

    /** 设置值 */
    public set value(newValue: T) {
        const oldValue = this._value;
        if (newValue != oldValue) {
            this._value = newValue;
            this.changed.dispatch(newValue, oldValue);
        }
    }

    /** 当前值 */
    public get value() {
        return this._value;
    }
}