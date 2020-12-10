import { Ref, ref } from "@vue/composition-api";
import Bindable from "../bindables/Bindable";

export function binableBindToRef<T>(bindable: Bindable<T>, ref: Ref, init: boolean = false) {
  bindable.changed.add((newValue: T) => {
    ref.value = newValue;
  });
  if (init) {
    ref.value = bindable.value;
  }
}

export function createBoundRef<T>(bindable: Bindable<T>, init: boolean = true) {
  let refObject = ref<T>(bindable.value);
  binableBindToRef(bindable, refObject, true);
  return refObject;
}