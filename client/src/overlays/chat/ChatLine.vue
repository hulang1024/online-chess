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
        >
          <span>{{ nickname }}</span>
          <user-menu
            v-if="hasMenu"
            :user="sender"
            :has-at="canAt"
            @at-click="onAtClick"
          />
        </span>
        <span v-if="!hasBackground">:</span>
      </div>
    </div>
    <div class="content">
      <q-menu
        v-if="hasMenu"
        touch-position
        :context-menu="isDesktop"
      >
        <q-list>
          <q-item
            key="copy"
            v-close-popup
            clickable
            @click="onCopyClick"
          >
            <q-item-section>复制</q-item-section>
          </q-item>
          <template v-if="canRecall">
            <q-separator />
            <q-item
              key="recall"
              v-close-popup
              clickable
              @click="onRecallClick"
            >
              <q-item-section>撤回</q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-menu>
      <span :style="{color: contentColor}">{{ content }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed, defineComponent, getCurrentInstance, PropType, ref,
} from "@vue/composition-api";
import device from "current-device";
import { copyToClipboard } from 'quasar';
import { api, channelManager } from "src/boot/main";
import ErrorMessage from "src/online/chat/ErrorMessage";
import Message from "src/online/chat/Message";
import { USERNAME_COLORS } from 'src/user/components/colors';
import { isSystemUser } from "src/user/User";
import UserMenu from "../user/UserMenu.vue";

export default defineComponent({
  components: { UserMenu },
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
  inject: ['showUserDetails', 'chatAtUser'],
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

    const hasMenu = computed(() => !isSystemUser(sender));

    const canAt = computed(() => !isSystemUser(sender) && sender.id != api.localUser.id);

    const canRecall = computed(() => sender.id != 0
      && (api.localUser.isAdmin || sender.id == api.localUser.id));

    const onAtClick = () => {
      // eslint-disable-next-line
      (context as any).chatAtUser(sender);
    };

    const onCopyClick = () => {
      copyToClipboard(message.content).catch(() => {
        context.$q.notify({ message: '复制失败', timeout: 500 });
      });
    };

    const onRecallClick = () => {
      channelManager.postCommand(`/recall ${message.id}`);
    };

    return {
      timeText,
      nickname: sender.nickname,
      nicknameColor: `#${(nicknameColor).toString(16)}`,
      hasBackground: sender.isAdmin,
      backgroundColor: sender.isAdmin ? '#512da8' : '',
      content: message.content,
      sender,
      contentColor,
      pending: message.id == null,
      hasMenu,
      // eslint-disable-next-line
      isDesktop: device.desktop(),
      canAt,
      canRecall,
      onAtClick,
      onCopyClick,
      onRecallClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.row {
  align-items: center;
}

.row > div {
  line-height: 1.4em;
  font-size: 1.1em;
}

.row.small > div {
  font-size: 1em;
}

.row.small > .time {
  font-size: 0.72em !important;
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
  width: 60px;
  font-size: 0.78em !important;
  user-select: none;
  font-family: Monaco, "Lucida Console", monospace;
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

.row .content {
  flex-grow: 1;
}
</style>
