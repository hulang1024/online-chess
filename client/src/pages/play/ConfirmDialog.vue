<template>
  <q-dialog
    v-model="isOpen"
    persistent
  >
    <q-card style="width: 300px">
      <q-card-section class="column items-center">
        <span class="q-ml-sm">{{ displayText }}</span>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          :label="_yesText"
          @click="() => onAction(true)"
          color="positive"
          v-close-popup
        />
        <q-btn
          :label="_noText"
          @click="() => onAction(false)"
          color="negative"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';

export default defineComponent({
  setup() {
    const isOpen = ref<boolean>(false);
    const _yesText = ref<string>('是');
    const _noText = ref<string>('否');
    const displayText = ref<string>('');

    let actionCallback: (isOk: boolean) => void;

    const open = ({
      text, yesText, noText, action,
    } : {text: string, yesText: string, noText: string, action: (isOk: boolean) => void}) => {
      displayText.value = text;
      _yesText.value = yesText;
      _noText.value = noText;
      actionCallback = action;
      isOpen.value = true;
    };

    const onAction = (isOk: boolean) => {
      actionCallback(isOk);
    };

    return {
      isOpen,
      displayText,
      _yesText,
      _noText,
      open,
      onAction,
    };
  },
});
</script>
