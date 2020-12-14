<template>
  <q-layout view="hHh lpR lFf">
    <q-header elevated>
      <toolbar ref="toolbar" />
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
import { defineComponent, getCurrentInstance } from '@vue/composition-api';
import SocialBrowserOverlay from 'src/overlays/social/SocialBrowserOverlay.vue';
import RankingOverlay from 'src/overlays/ranking/RankingOverlay.vue';
import SettingsOverlay from '../overlays/settings/SettingsOverlay.vue';
import ChatOverlay from '../overlays/chat/ChatOverlay.vue';
import UserButton from '../overlays/toolbar/UserButton.vue';
import Toolbar from '../overlays/toolbar/Toolbar.vue';

export default defineComponent({
  name: 'MainLayout',
  components: {
    Toolbar,
    SettingsOverlay,
    ChatOverlay,
    SocialBrowserOverlay,
    RankingOverlay,
  },
  setup() {
    const { $refs } = getCurrentInstance() as Vue;

    const onPageClick = () => {
      $refs.toolbar.exitActive();
    };

    return {
      onPageClick,
    };
  },
});
</script>
