<template>
  <div class="chat-input-box full-width">
    <q-input
      ref="messageInput"
      v-model="messageText"
      :outlined="!$q.dark.isActive"
      :standout="$q.dark.isActive"
      dense
      placeholder="键入你的消息"
      :disable="!enabled"
      class="message-input"
      @keydown.enter="onSend"
    >
      <template v-slot:before>
        <q-btn
          icon="mood"
          flat
          padding="sm"
          class="cursor-pointer"
        >
          <q-popup-proxy
            ref="emojiPanelProxy"
            :offset="[0, 10]"
          >
            <emoji-panel @emoji-select="onEmojiSelect" />
          </q-popup-proxy>
        </q-btn>
      </template>
      <template v-slot:after>
        <q-btn
          icon="keyboard_return"
          unelevated
          padding="7px"
          label="发送"
          class="send"
          @click="onSend"
        />
      </template>
    </q-input>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, PropType, ref,
} from '@vue/composition-api';
import { channelManager } from 'src/boot/main';
import Channel from 'src/online/chat/Channel';
import EmojiPanel from './EmojiPanel.vue';

export default defineComponent({
  components: { EmojiPanel },
  props: {
    channel: {
      type: Object as PropType<Channel>,
      require: false,
    },
  },
  setup(props) {
    const context = getCurrentInstance() as Vue;
    // eslint-disable-next-line
    const notify = context.$q.notify;

    const messageText = ref('');
    const enabled = ref(true);

    const onSend = () => {
      const text = messageText.value.trim();
      if (!text) {
        return;
      }
      if (text.length > 200) {
        notify({ type: 'warning', message: '消息过长' });
        return;
      }

      const { channel } = props;
      if (text[0] == '/' && text.length > 1) {
        channelManager.postCommand(text, channel);
      } else {
        channelManager.postMessage(text, false, channel);
      }

      messageText.value = '';
    };

    const onEmojiSelect = (emoji: string) => {
      messageText.value += emoji;
      if (!context.$q.screen.xs) {
        context.$nextTick(() => {
          // eslint-disable-next-line
          (context.$refs.messageInput as any).focus();
        });
      }
      // eslint-disable-next-line
      (context.$refs.emojiPanelProxy as any).hide();
    };

    channelManager.wordsEnableSignal.add((value: boolean) => {
      enabled.value = value;
    });

    return {
      messageText,
      enabled,
      onSend,
      onEmojiSelect,
    };
  },
});
</script>
<style scoped>
.message-input >>> .q-field__before {
  padding-right: 2px;
}

.send {
  background-color: #575757;
  color: #fff;
}

.send >>> .q-icon.on-left {
  margin-right: 2px;
}
</style>
