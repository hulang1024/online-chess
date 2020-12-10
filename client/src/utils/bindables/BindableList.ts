/// <reference path="../signals/Signal.ts" />

import Signal from "../signals/Signal";
import Bindable from "./Bindable";

export default class BindableList<T> extends Bindable<T[]> {
  public readonly added: Signal = new Signal();
  public readonly removed: Signal = new Signal();

  constructor(defaultValue: T[] = []) {
    super(defaultValue);
  }

  public get length() {
    return this._value.length;
  }

  public add(item: T) {
    this._value.push(item);
    this.added.dispatch(item);
    this.changed.dispatch(this._value);
  }

  public removeIf(pred: Function) {
    for (let i = 0; i < this._value.length; i++) {
      if (pred(this._value[i])) {
        return this.removeAt(i);
      }
    }
    return false;
  }

  public remove(item: T): boolean {
    let index = this._value.indexOf(item);
    return this.removeAt(index);
  }

  public removeAt(index: number): boolean {
    if (index > -1) {
      let item = this._value[index];
      this._value.splice(index, 1);
      this.removed.dispatch(item);
      this.changed.dispatch(this._value);
      return true;
    } else {
      return false;
    }
  }

  public reduce(callback: any, initialValue: any) {
    return this._value.reduce(callback, initialValue);
  }
  
  public filter(pred: any) {
    return this._value.filter(pred);
  }
}