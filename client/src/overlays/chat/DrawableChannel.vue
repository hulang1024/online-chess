<template>
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
    class="channel"
  >
    <chat-line
      v-for="msg in messages"
      :key="msg.id"
      :message="msg"
      v-bind="chatLineProps"
    />
  </q-scroll-area>
</template>
<script lang="ts">
import {
  defineComponent, getCurrentInstance, onMounted, PropType, ref,
} from '@vue/composition-api';
import Channel from 'src/online/chat/Channel';
import Message from 'src/online/chat/Message';
import { scroll } from 'quasar';
import ChatLine from './ChatLine.vue';

export default defineComponent({
  components: { ChatLine },
  props: {
    channel: {
      type: Object as PropType<Channel>,
      require: true,
    },
    chatLineProps: Object
  },
  setup(props) {
    const ctx = getCurrentInstance() as Vue;
    const channel = props.channel as Channel;
    const messages = ref<Message[]>(channel?.messages || []);

    const updateScroll = () => {
      // eslint-disable-next-line
      (ctx.$refs.scrollArea as Vue)?.$nextTick(() => {
        // eslint-disable-next-line
        const el = ((ctx.$refs.scrollArea as Vue).$el as Element).firstChild?.firstChild;
        const pos = scroll.getScrollHeight(el as Element);
        // eslint-disable-next-line
        (ctx.$refs.scrollArea as any).setScrollPosition(pos, 100);
      });
    };

    channel.newMessagesArrived.add((newMsgs: Message[]) => {
      messages.value = messages.value?.concat(newMsgs);
      updateScroll();
    });

    channel.messageRemoved.add((msgId: number) => {
      messages.value = messages.value?.filter((m) => m.id != msgId);
      updateScroll();
    });

    onMounted(() => {
      updateScroll();
    });

    return {
      messages,
    };
  },
});
</script>

<style lang="sass" scoped>
.channel
  width: 100%
  height: 100%
</style>