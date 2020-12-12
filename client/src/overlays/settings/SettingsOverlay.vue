<template>
  <q-drawer
    v-model="isOpen"
    bordered
    overlay
    behavior="desktop"
    class="settings-drawer z-top"
    content-class="row"
  >
    <q-tabs
      v-model="activeTab"
      vertical
      class="col text-white"
    >
      <q-tab
        name="general"
        label="通用"
      />
      <q-tab
        name="display"
        label="显示"
      />
      <q-tab
        name="audio"
        label="声音"
      />
    </q-tabs>
    <div class="col content">
      <q-toggle
        v-model="configState.darkEnabled"
        label="深色模式"
      />
      <q-toggle
        v-model="configState.fullscreen"
        label="全屏"
      />
      <q-toggle
        v-if="supportDesktopNotify"
        v-model="configState.desktopNotifyEnabled"
        label="开启桌面通知"
      />
    </div>
  </q-drawer>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, reactive, ref, watch,
} from '@vue/composition-api';
import { configManager } from 'src/boot/main';
import { ConfigItem } from 'src/config/ConfigManager';

export default defineComponent({
  setup() {
    const isOpen = ref(false);

    const toggle = () => {
      isOpen.value = !isOpen.value;
    };

    const show = () => {
      isOpen.value = true;
    };

    const hide = () => {
      isOpen.value = false;
    };

    const activeTab = ref('display');

    const configState = reactive({
      darkEnabled: configManager.get(ConfigItem.theme) == 'dark',
      fullscreen: false,
      desktopNotifyEnabled: false,
    });

    const supportDesktopNotify = ref('Notification' in window);

    const ctx = getCurrentInstance() as Vue;

    watch(() => configState.darkEnabled, () => {
      ctx.$q.dark.set(configState.darkEnabled);
      configManager.set(ConfigItem.theme, configState.darkEnabled ? 'dark' : 'default');
      configManager.save();
    });

    watch(() => configState.fullscreen, () => {
      setTimeout(() => {
        if (configState.fullscreen) {
          // eslint-disable-next-line
          ctx.$q.fullscreen.request();
        } else {
          // eslint-disable-next-line
          ctx.$q.fullscreen.exit();
        }
      }, 100);
    });

    watch(() => configState.desktopNotifyEnabled, () => {
      if (!configState.desktopNotifyEnabled) {
        return;
      }

      Notification.requestPermission().then((permission) => {
        if (permission == 'granted') {
          ctx.$q.notify({ type: 'positive', message: '开启成功' });
        } else {
          ctx.$q.notify({ type: 'warning', message: '开启失败，请点击允许' });
        }
      }).catch(() => {
        ctx.$q.notify({ type: 'positive', message: '开启失败了' });
      });
    });

    return {
      isOpen,
      toggle,
      show,
      hide,
      activeTab,
      configState,
      supportDesktopNotify,
    };
  },
});
</script>

<style>
.settings-drawer > .q-drawer {
  width: 70% !important;
  max-width: 300px;
  background-color: transparent;
  color: white;
}
</style>
<style lang="scss" scoped>
.q-tabs {
  max-width: 60px !important;
  background-color: black;
  opacity: 0.8;
}

.content {
  background-color: black;
  opacity: 0.7;
  color: white;
}
</style>
