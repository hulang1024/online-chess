<template>
  <transition
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
    :duration="200"
  >
    <q-card v-show="isOpen">
      <q-card-section class="row items-center">
        <span
          class="result-text q-ml-sm text-h3 full-width text-center"
          :class="resultClass"
        >{{ displayText }}</span>
      </q-card-section>

      <q-card-actions
        align="evenly"
        class="q-pb-md"
      >
        <q-btn
          v-if="showAgain"
          label="再来"
          push
          @click="() => onAction('again')"
          color="light-green"
          v-close-popup
        />
        <q-btn
          label="确定"
          push
          @click="() => onAction('ok')"
          color="primary"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';

export default defineComponent({
  props: {
    showAgain: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const isOpen = ref<boolean>(false);
    const resultClass = ref<string>();
    const displayText = ref<string>('');

    let actionCallback: (action: string | null) => void;

    const open = ({ result, isTimeout, action }:
      {result: number, isTimeout: boolean, action: (action: string | null) => void}) => {
      const resultMap: { [t: number]: { text: string, class: string }} = {
        0: { text: '平局', class: 'draw' },
        1: { text: isTimeout ? '超时胜利' : '胜利', class: 'win' },
        2: { text: isTimeout ? '超时失败' : '失败', class: 'lose' },
      };
      resultClass.value = resultMap[result].class;
      displayText.value = resultMap[result].text;
      actionCallback = action;
      isOpen.value = true;
    };

    const onAction = (act: string) => {
      actionCallback(act);
      isOpen.value = false;
    };

    return {
      isOpen,
      resultClass,
      displayText,
      open,
      onAction,
    };
  },
});
</script>

<style lang="sass" scoped>
.q-card
  width: 300px
  background: rgba(255, 255, 255, 0.4)
  box-shadow: 0px 3px 6px 4px rgba(0, 0, 0, 0.2)
  border-radius: 6px

.result-text
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.2)
  font-weight: bolder

  &.draw
    color: #ff9800
  &.win
    color: #e91e63
  &.lose
    color: #2196f3

.q-btn
  padding: 2px 14px
</style>
