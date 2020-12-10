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
          @click="onSettingButtonClick"
        >
          <q-tooltip content-class="bg-black">设置</q-tooltip>
        </q-btn>

        <q-toolbar-title></q-toolbar-title>

        <q-btn
          flat
          dense
          icon="chat"
          class="toolbar-button q-px-sm"
          @click="onChatButtonClick"
        >
          <q-tooltip content-class="bg-black">聊天</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="people"
          class="toolbar-button q-px-sm"
          @click="onOnlineUsersButtonClick"
        >
          <q-tooltip content-class="bg-black">在线用户</q-tooltip>
        </q-btn>

        <user-button />

      </q-toolbar>
    </q-header>

    <settings-overlay ref="settingsOverlay" />
    <social-browser-overlay ref="socialBrowserOverlay" />
    <chat-overlay ref="chatOverlay" />

    <q-page-container @click="onPageClick" >
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, reactive, ref } from '@vue/composition-api';
import User from 'src/online/user/User';
import SettingsOverlay from '../overlays/settings/SettingsOverlay.vue';
import ChatOverlay from '../overlays/chat/ChatOverlay.vue';
import UserButton from '../overlays/toolbar/UserButton.vue';
import SocialBrowserOverlay from 'src/overlays/social/SocialBrowserOverlay.vue';

export default defineComponent({
  name: 'MainLayout',
  components: { SettingsOverlay, ChatOverlay, UserButton, SocialBrowserOverlay },
  setup() {
    const ctx = getCurrentInstance();
    const { $refs } = <any>ctx;

    const onPageClick = () => {
      $refs.settingsOverlay.hide();
      $refs.chatOverlay.hide();
    };
        
    const onSettingButtonClick = () => {
      $refs.settingsOverlay.toggle();
    };

    const onChatButtonClick = () => {
      $refs.chatOverlay.toggle();
    };

    const onOnlineUsersButtonClick = () => {
      $refs.socialBrowserOverlay.toggle();
    };

    return {
      onPageClick,
      onSettingButtonClick,
      onChatButtonClick,
      onOnlineUsersButtonClick
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
}
</style>