<template>
  <div class="channel">
    <q-inner-loading
      :showing="loading"
      class="bg-transparent"
      color="primary"
      size="2em"
    />
    <q-scroll-area
      ref="scrollArea"
      :delay="200"
      :thumb-style="{
        right: '0px',
        borderRadius: '6px',
        backgroundColor: '#eee',
        width: '6px',
        opacity: 0.8
      }"
    >
      <chat-line
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        v-bind="chatLineProps"
      />
    </q-scroll-area>
  </div>
</template>
<script lang="ts">
import {
  defineComponent, getCurrentInstance, onMounted, PropType, ref,
} from 'vue';
import Channel from 'src/online/chat/Channel';
import Message from 'src/online/chat/Message';
import LocalEchoMessage from 'src/online/chat/LocalEchoMessage';
import { createBoundRef } from 'src/utils/vue/vue_ref_utils';
import { scroll } from 'quasar';
import ChatLine from './ChatLine.vue';

export default defineComponent({
  components: { ChatLine },
  props: {
    channel: {
      type: Object as PropType<Channel>,
      require: true,
    },
    chatLineProps: Object,
  },
  setup(props) {
    const ctx = getCurrentInstance()!.proxy as unknown as Vue;
    const channel = props.channel as Channel;
    const loading = createBoundRef(channel.loading);
    const messages = ref<Message[]>(channel?.messages || []);

    const updateScroll = (duration = 200) => {
      // eslint-disable-next-line
      (ctx.$refs.scrollArea as Vue)?.$nextTick(() => {
        // eslint-disable-next-line
        const el = ((ctx.$refs.scrollArea as Vue).$el as Element).firstChild?.firstChild;
        const pos = scroll.getScrollHeight(el as Element);
        // eslint-disable-next-line
        (ctx.$refs.scrollArea as any).setScrollPosition(pos, duration);
      });
    };

    channel.newMessagesArrived.add((newMsgs: Message[]) => {
      messages.value = messages.value?.concat(newMsgs);
      updateScroll();
    });

    channel.messageRemoved.add((message: Message) => {
      const pred = (m: Message) => (message.id ? m.id != message.id : m != message);
      messages.value = messages.value?.filter(pred);
      updateScroll();
    });

    channel.pendingMessageResolved.add((echo: LocalEchoMessage, final: Message) => {
      const message = messages.value.find((m) => m == echo);
      if (message) {
        ctx.$set(message, 'id', final.id);
      }
    });

    onMounted(() => {
      updateScroll(0);
    });

    return {
      loading,
      messages,
    };
  },
});
</script>

<style lang="sass" scoped>
.channel
  width: 100%
  height: 100%

  .q-scrollarea
    width: inherit
    height: inherit
</style>

<style scoped>
.q-scrollarea >>> .scroll > div {
  padding-bottom: 4px;
}
</style>
