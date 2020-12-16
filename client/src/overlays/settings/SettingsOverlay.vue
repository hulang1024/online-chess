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
      <div v-if="supportDesktopNotify" class="section-row toggle-row">
        <label>开启桌面通知</label>
        <q-toggle
          v-model="configState.desktopNotifyEnabled"
        />
      </div>
      <div class="section-row toggle-row">
        <label>深色模式</label>
        <q-toggle
          v-model="configState.darkEnabled"
        />
      </div>
      <div class="section-row toggle-row">
        <label>全屏</label>
        <q-toggle
          v-model="configState.fullscreen"
        />
      </div>
      <div class="section-row toggle-row">
        <label>开启游戏声音</label>
        <q-toggle
          v-model="configState.audioGameEnabled"
        />
      </div>
      <div class="section-row">
        <div>总音量</div>
        <q-slider
          v-model="configState.audioVolume"
          :min="0"
          :max="100"
          label
        />
      </div>
    </div>
  </q-drawer>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, reactive, ref, watch,
} from '@vue/composition-api';
import { audioManager, configManager } from 'src/boot/main';
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
      audioGameEnabled: configManager.get(ConfigItem.audioGameEnabled) as boolean,
      audioVolume: configManager.get(ConfigItem.audioVolume) as number * 100,
    });

    const supportDesktopNotify = ref('Notification' in window);

    const ctx = getCurrentInstance() as Vue;

    watch(configState, () => {
      ctx.$q.dark.set(configState.darkEnabled);
      configManager.set(ConfigItem.theme, configState.darkEnabled ? 'dark' : 'default');
      configManager.set(ConfigItem.audioGameEnabled, configState.audioGameEnabled);
      configManager.set(ConfigItem.audioVolume, configState.audioVolume / 100);
      configManager.save();
      audioManager.volume.value = configState.audioVolume / 100;
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
<style lang="sass" scoped>
.q-tabs
  max-width: 60px !important
  background-color: black
  opacity: 0.8

.content
  position: relative
  padding: 8px
  background-color: black
  opacity: 0.78
  color: white

  .section-row
    &.toggle-row
      display: flex
      flex-direction: row
      justify-content: space-between

    .q-slider
      width: calc(100% - 16px)
</style>
