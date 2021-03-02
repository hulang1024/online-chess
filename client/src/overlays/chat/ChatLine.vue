<template>
  <div
    class="row"
    :class="{small, pending}"
  >
    <div class="time">
      {{ timeText }}
    </div>
    <div
      class="nickname_col"
      :class="{'right-align': rightAlign}"
    >
      <div
        class="nickname"
        :class="{'has-background': hasBackground}"
        @click="onNicknameClick"
        :style="{
          color: hasBackground ? ($q.dark.isActive ? '#111' : '#fff') : nicknameColor,
        }"
      >
        <span
          class="nickname__text"
          :class="{ellipsis: rightAlign}"
          :style="{
            background: hasBackground ? backgroundColor : ''
          }"
        >{{ nickname }}</span>
        <span v-if="!hasBackground">:</span>
      </div>
    </div>
    <div class="content">
      <span :style="{color: contentColor}">{{ content }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, PropType, ref,
} from "@vue/composition-api";
import ErrorMessage from "src/online/chat/ErrorMessage";
import Message from "src/online/chat/Message";
import { USERNAME_COLORS } from 'src/user/components/colors';

export default defineComponent({
  props: {
    message: {
      type: Object as PropType<Message>,
      require: true,
    },
    rightAlign: {
      type: Boolean,
      default: true,
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
  inject: ['showUserDetails'],
  setup(props) {
    const context = getCurrentInstance() as Vue;
    const message = props.message as Message;
    const sender = message?.sender;

    const timeText = ((timestamp: number) => {
      const time = new Date(timestamp);
      const pad = (n: number) => (n > 9 ? n : `0${n}`);
      return `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
    })(message?.timestamp);

    const nicknameColor = (message.id > 0 || message.id == null)
      ? USERNAME_COLORS[Math.abs(sender.id) % USERNAME_COLORS.length]
      : '';

    const contentColor = ref<string>('');
    if (message instanceof ErrorMessage) {
      contentColor.value = 'pink';
    }

    const onNicknameClick = () => {
      if (sender.id == 0) {
        return;
      }
      // eslint-disable-next-line
      (context as any).showUserDetails(sender);
    };

    return {
      timeText,
      nickname: sender.nickname,
      nicknameColor: `#${(nicknameColor).toString(16)}`,
      hasBackground: sender.isAdmin,
      backgroundColor: sender.isAdmin ? '#1f78ff' : '',
      content: message.content,
      contentColor,
      pending: message.id == null,
      onNicknameClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.row > div {
  line-height: 1.4em;
  font-size: 1.1em;
}

.row.small > div {
  font-size: 1em;
}

@media (max-width: $breakpoint-xs-max) {
  .row > div {
    font-size: 1em;
  }
  .nickname_col {
    width: 96px !important;
  }
}

.row > .time {
  width: 54px;
  font-size: 0.9em !important;
  user-select: none;
}

.row > .nickname_col {
  margin-right: 8px;
}
.row > .nickname_col.right-align {
  width: 110px;
  text-align: right;
}
.row .nickname {
  display: flex;
  justify-content: flex-end;
  flex-wrap: nowrap;
  font-weight: 600;
  user-select: none;
}
.row .nickname.has-background > .nickname__text {
  padding: 1px 4px;
  border-radius: 4px;
  line-height: normal;
}

.row .nickname__text:hover {
  opacity: 0.6;
}
</style>
