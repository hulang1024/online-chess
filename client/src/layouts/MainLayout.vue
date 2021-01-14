<template>
  <q-layout view="hHh lpR lFf">
    <q-header>
      <toolbar ref="toolbar" />
    </q-header>

    <settings-overlay ref="settingsOverlay" />
    <social-browser-overlay ref="socialBrowserOverlay" />
    <ranking-overlay ref="rankingOverlay" />
    <chat-overlay ref="chatOverlay" />

    <q-page-container @click="onPageClick">
      <router-view v-if="isViewAlive" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, provide, ref,
} from '@vue/composition-api';
import SocialBrowserOverlay from 'src/overlays/social/SocialBrowserOverlay.vue';
import RankingOverlay from 'src/overlays/ranking/RankingOverlay.vue';
import SettingsOverlay from '../overlays/settings/SettingsOverlay.vue';
import ChatOverlay from '../overlays/chat/ChatOverlay.vue';
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
    const ctx = getCurrentInstance() as Vue;
    const { $refs } = ctx;

    const onPageClick = () => {
      // eslint-disable-next-line
      (<any>$refs.toolbar).exitActive();
    };

    const isViewAlive = ref(true);

    provide('reload', () => {
      isViewAlive.value = false;
      ctx.$nextTick(() => {
        isViewAlive.value = true;
      });
    });

    return {
      isViewAlive,

      onPageClick,
    };
  },
});
</script>
