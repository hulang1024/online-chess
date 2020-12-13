import { Ref, ref } from "@vue/composition-api";
import Bindable from "../bindables/Bindable";

export function binableBindToRef<T>(bindable: Bindable<T>, toRef: Ref, init = true) {
  bindable.changed.add((newValue: T) => {
    toRef.value = newValue;
  });
  if (init) {
    toRef.value = bindable.value;
  }
}

export function createBoundRef<T>(bindable: Bindable<T>, init = true) {
  const refObject = ref<T>(bindable.value);
  binableBindToRef(bindable, refObject, init);
  return refObject;
}
