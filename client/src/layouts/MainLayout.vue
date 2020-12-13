<template>
  <q-layout view="hHh lpR lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          icon="settings"
          aria-label="Settings"
          class="toolbar-button q-px-sm"
          :class="{active: isActive('settings')}"
          @click="onSettingButtonClick"
        >
          <q-tooltip content-class="bg-black">
            设置
          </q-tooltip>
        </q-btn>

        <q-toolbar-title></q-toolbar-title>

        <q-btn
          flat
          dense
          icon="chat"
          class="toolbar-button q-px-sm"
          :class="{active: isActive('chat')}"
          @click="onChatButtonClick"
        >
          <q-tooltip content-class="bg-black">聊天</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="fas fa-chart-bar"
          class="toolbar-button q-px-sm"
          :class="{active: isActive('ranking')}"
          @click="onRankingButtonClick"
        >
          <q-tooltip content-class="bg-black">
            排名
          </q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="fas fa-users"
          class="toolbar-button q-px-sm"
          :class="{active: isActive('socialBrowser')}"
          @click="onOnlineUsersButtonClick"
        >
          <q-tooltip content-class="bg-black">
            在线用户
          </q-tooltip>
        </q-btn>

        <user-button @click="onUserButtonClick" />
      </q-toolbar>
    </q-header>

    <settings-overlay ref="settingsOverlay" />
    <social-browser-overlay ref="socialBrowserOverlay" />
    <ranking-overlay ref="rankingOverlay" />
    <chat-overlay ref="chatOverlay" />

    <q-page-container @click="onPageClick">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, ref } from '@vue/composition-api';
import SocialBrowserOverlay from 'src/overlays/social/SocialBrowserOverlay.vue';
import RankingOverlay from 'src/overlays/ranking/RankingOverlay.vue';
import SettingsOverlay from '../overlays/settings/SettingsOverlay.vue';
import ChatOverlay from '../overlays/chat/ChatOverlay.vue';
import UserButton from '../overlays/toolbar/UserButton.vue';

export default defineComponent({
  name: 'MainLayout',
  components: {
    SettingsOverlay, ChatOverlay, UserButton, SocialBrowserOverlay, RankingOverlay,
  },
  setup() {
    const { $refs } = getCurrentInstance() as Vue;
    const actives = ref<string[]>([]);

    const isActive = (name: string) => actives.value.includes(name);

    const toggleActive = (name: string, active?: boolean) => {
      active = (active === undefined ? !isActive(name) : active);
      if (active) {
        actives.value.push(name);
      } else {
        actives.value = actives.value.filter((a) => a != name);
      }

      // eslint-disable-next-line
      (<any>$refs[`${name}Overlay`] as any)[active ? 'show' : 'hide']();
    };

    const excludeToggle = (name: string, exclude?: string) => {
      if (!isActive(name)) {
        actives.value.forEach((s) => {
          if (s != name && s != exclude) {
            toggleActive(s, false);
          }
        });
      }
      toggleActive(name);
    };

    const onPageClick = () => {
      actives.value.forEach((name) => {
        toggleActive(name, false);
      });
      
      toggleActive('chat', false); // chat会在其它地方打开，但可能没在actives中
    };

    const onSettingButtonClick = () => {
      excludeToggle('settings', 'chat');
    };

    const onChatButtonClick = () => {
      excludeToggle('chat');
    };

    const onOnlineUsersButtonClick = () => {
      excludeToggle('socialBrowser');
    };

    const onRankingButtonClick = () => {
      excludeToggle('ranking');
    };

    const onUserButtonClick = () => {
      actives.value.forEach((name) => {
        toggleActive(name, false);
      });
    };

    return {
      isActive,

      onPageClick,
      onSettingButtonClick,
      onChatButtonClick,
      onOnlineUsersButtonClick,
      onRankingButtonClick,
      onUserButtonClick,
    };
  },
});
</script>

<style lang="scss">
.q-toolbar {
  padding-left: 0px;
  padding-right: 0px;
  height: 40px !important;
  min-height: 40px;
}

.toolbar-button {
  height: 100%;

  .fas {
    font-size: 20px;
  }
  &.active {
    background: #517bda;
  }
}
</style>
