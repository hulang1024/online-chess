<template>
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

    <q-toolbar-title style="padding:0px"></q-toolbar-title>

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
</template>
<script lang="ts">
import {
  defineComponent, getCurrentInstance, onMounted, ref,
} from 'vue';
import UserButton from './UserButton.vue';

export default defineComponent({
  components: {
    UserButton,
  },
  setup() {
    const ctx = getCurrentInstance()!.proxy as unknown as Vue;
    const overlayRefs = ctx.$vnode.context?.$refs;
    const actives = ref<string[]>([]);

    const isActive = (name: string) => actives.value.includes(name);

    const onActiveChange = (name: string, active: boolean) => {
      if (active) {
        actives.value.push(name);
      } else {
        actives.value = actives.value.filter((a) => a != name);
      }
    };

    onMounted(() => {
      ['settings', 'chat', 'ranking', 'socialBrowser'].forEach((name) => {
        if (overlayRefs) {
          // eslint-disable-next-line
          (<any>overlayRefs[`${name}Overlay`] as Vue).$on('active', (active: boolean) => {
            onActiveChange(name, active);
          });
        }
      });
    });

    const toggleActive = (name: string, active?: boolean) => {
      active = (active === undefined ? !isActive(name) : active);
      onActiveChange(name, active);
      if (overlayRefs) {
        // eslint-disable-next-line
        (<any>overlayRefs[`${name}Overlay`] as any)[active ? 'show' : 'hide']();
      }
    };

    const excludeToggle = (name: string, active?: boolean) => {
      if (!isActive(name)) {
        actives.value.forEach((s) => {
          if (s != name) {
            toggleActive(s, false);
          }
        });
      }
      toggleActive(name, active);
    };

    const exitActive = (exclude?: string) => {
      actives.value.forEach((name) => {
        if (exclude && exclude == name) {
          return;
        }
        toggleActive(name, false);
      });
      if (exclude == 'chat') {
        return;
      }
      toggleActive('chat', false); // chat会在其它地方打开，但可能没在actives中
    };

    const onSettingButtonClick = () => {
      excludeToggle('settings');
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

      exitActive,
      toggle: excludeToggle,
      excludeToggle,

      onActiveChange,
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
  height: 36px !important;
  min-height: 36px;
}

.toolbar-button {
  height: 100%;

  .fas {
    font-size: 19px;
  }
  &.active {
    background: #666;
    color: #fff;
    border-radius: 0px;
  }
}
</style>
