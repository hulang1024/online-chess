<template>
  <q-drawer
    v-model="isOpen"
    overlay
    behavior="desktop"
    class="settings-drawer z-top"
    content-class="row"
  >
    <q-tabs
      v-model="activeTab"
      vertical
      class="col"
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
        <label>背景音乐</label>
        <q-toggle
          v-model="configState.bgmEnabled"
        />
      </div>
      <div class="section-row toggle-row">
        <label>开启声音</label>
        <q-toggle
          v-model="configState.audioEnabled"
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

        <div class="version absolute-bottom text-center q-py-sm">
          <a
            class="link"
            target="_blank"
            href="https://github.com/hulang1024/online-chess"
          >Github Repository</a>
        </div>
      </div>
    </div>
  </q-drawer>
</template>

<script lang="ts">
import {
  defineComponent, getCurrentInstance, reactive, ref, watch,
} from 'vue';
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
      darkEnabled: configManager.get(ConfigItem.darkMode) as boolean,
      fullscreen: false,
      desktopNotifyEnabled: configManager.get(ConfigItem.desktopNotifyEnabled),
      bgmEnabled: configManager.get(ConfigItem.bgmEnabled) as boolean,
      audioEnabled: configManager.get(ConfigItem.audioEnabled) as boolean,
      audioVolume: configManager.get(ConfigItem.audioVolume) as number * 100,
    });

    const supportDesktopNotify = ref('Notification' in window);

    const ctx = getCurrentInstance()!.proxy as unknown as Vue;

    watch(configState, () => {
      ctx.$q.dark.set(configState.darkEnabled);
      configManager.set(ConfigItem.darkMode, configState.darkEnabled);
      configManager.set(ConfigItem.bgmEnabled, configState.bgmEnabled);
      configManager.set(ConfigItem.audioEnabled, configState.audioEnabled);
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
      if (configState.desktopNotifyEnabled) {
        Notification.requestPermission().then((permission) => {
          if (permission == 'granted') {
            ctx.$q.notify({ type: 'positive', message: '开启成功' });
            configManager.set(ConfigItem.desktopNotifyEnabled, true);
            configManager.save();
          } else {
            ctx.$q.notify({ type: 'warning', message: '开启失败，请点击允许' });
            configManager.set(ConfigItem.desktopNotifyEnabled, false);
            configManager.save();
          }
        }).catch(() => {
          ctx.$q.notify({ type: 'positive', message: '开启失败了' });
          configManager.set(ConfigItem.desktopNotifyEnabled, false);
          configManager.save();
        });
      } else {
        configManager.set(ConfigItem.desktopNotifyEnabled, false);
        configManager.save();
      }
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
}
</style>
<style lang="sass" scoped>
.q-tabs
  max-width: 60px !important

.content
  position: relative
  padding: 8px
  opacity: 0.78

  .section-row
    margin-bottom: 8px
    &.toggle-row
      display: flex
      flex-direction: row
      justify-content: space-between
      align-items: center
    .q-slider
      width: calc(100% - 16px)

  .version
    font-family: TnT, Meiryo, sans-serif

    .link
      text-decoration: none
      color: inherit
      opacity: 0.7
      font-style: italic

      &:hover
        opacity: 1
</style>
