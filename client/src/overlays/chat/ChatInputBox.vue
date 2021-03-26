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
      @focus="onFocus"
      @blur="onBlur"
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
            @show="onFocus"
            @blur="onBlur"
          >
            <emoji-panel @emoji-select="onEmojiSelect" />
          </q-popup-proxy>
        </q-btn>
      </template>
      <template v-slot:after>
        <q-btn
          color="primary"
          unelevated
          padding="7px 12px"
          label="发送"
          :disable="sendDisable"
          class="send"
          @click="onSend"
        />
      </template>
    </q-input>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, onUnmounted, PropType, ref, watch,
} from '@vue/composition-api';
import { channelManager, socketService } from 'src/boot/main';
import Channel from 'src/online/chat/Channel';
import User from 'src/user/User';
import EmojiPanel from './EmojiPanel.vue';

// 全局唯一
const messageText = ref('');

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
    const sendDisable = ref(true);
    const enabled = ref(true);

    watch(messageText, (text) => {
      sendDisable.value = text.length == 0;
    });

    const focus = () => {
      // eslint-disable-next-line
      (context.$refs.messageInput as any).focus();
    };

    const atUser = (user: User) => {
      messageText.value += `@${user.nickname}`;
    };

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

    let nowTyping = false;
    const sendTyping = (typing: boolean) => {
      if (nowTyping == typing) {
        return;
      }
      nowTyping = typing;
      socketService.send('play.chat_status', { typing });
    };
    const isPlaying = () => context.$router.currentRoute.name as string == 'play';
    const onFocus = () => {
      if (isPlaying()) {
        sendTyping(true);
      }
    };

    const onBlur = () => {
      if (isPlaying()) {
        sendTyping(false);
      }
    };

    onUnmounted(onBlur);

    return {
      messageText,
      enabled,
      sendDisable,
      focus,
      atUser,
      onSend,
      onFocus,
      onBlur,
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
  transition: all 0.1s ease-out;
}

.send >>> .q-icon.on-left {
  margin-right: 2px;
}
</style>
