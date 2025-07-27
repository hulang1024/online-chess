<template>
  <q-layout view="hHh lpR lFf">
    <q-header
      v-show="!headerHide"
      :style="{background: $q.dark.isActive ? '#252525' : '#4f4f4f'}"
    >
      <toolbar ref="toolbar" />
    </q-header>

    <settings-overlay ref="settingsOverlay" />
    <social-browser-overlay ref="socialBrowserOverlay" />
    <ranking-overlay ref="rankingOverlay" />
    <chat-overlay ref="chatOverlay" />

    <user-details-overlay ref="userDetailsOverlay" />

    <q-page-container @click="onPageClick">
      <router-view v-if="isViewAlive" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, provide, ref, watch,
} from 'vue';
import User from 'src/user/User';
import SocialBrowserOverlay from 'src/overlays/social/SocialBrowserOverlay.vue';
import RankingOverlay from 'src/overlays/ranking/RankingOverlay.vue';
import UserDetailsOverlay from 'src/overlays/user/UserDetailsOverlay.vue';
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
    UserDetailsOverlay,
  },
  setup() {
    const ctx = getCurrentInstance()!.proxy as unknown as Vue;
    const { $refs } = ctx;

    const onPageClick = () => {
      // eslint-disable-next-line
      (<any>$refs.toolbar).exitActive(ctx.$router.currentRoute.name == 'lobby' && 'chat');
    };

    const isViewAlive = ref(true);

    provide('reload', () => {
      isViewAlive.value = false;
      ctx.$nextTick(() => {
        isViewAlive.value = true;
      });
    });

    provide('showUserDetails', (user: User) => {
      // eslint-disable-next-line
      (ctx.$refs.userDetailsOverlay as any).show(user);
    });

    provide('excludeToggle', (name: string, active?: boolean) => {
      // eslint-disable-next-line
      (<any>$refs.toolbar).excludeToggle(name, active);
    });

    const headerHide = ref(false);

    watch(() => ctx.$route, () => {
      // eslint-disable-next-line
      headerHide.value = ctx.$q.platform.is.mobile
        && ['play', 'spectate'].includes(ctx.$router.currentRoute.name as string);
    });

    return {
      headerHide,
      isViewAlive,

      onPageClick,
    };
  },
});
</script>
