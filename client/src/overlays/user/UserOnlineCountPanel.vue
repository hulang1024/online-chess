<template>
  <div class="q-py-xs">
    <q-chip square>
      <span>在线</span>
      <span class="count number">{{ online }}</span>
    </q-chip>
    <q-chip square>
      <q-icon name="desktop_windows" />
      <span class="count number">{{ pc }}</span>
    </q-chip>
    <q-chip square>
      <q-icon name="phone_iphone" />
      <span class="count number">{{ mobile }}</span>
    </q-chip>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, reactive, toRefs,
} from '@vue/composition-api';
import { socketService } from 'src/boot/main';
import UserOnlineCounters from 'src/online/user/UserOnlineCounters';
import { StatOnlineCountMsg } from 'src/online/stat';

let userCounters: UserOnlineCounters | null = null;

export default defineComponent({
  setup() {
    if (userCounters == null) {
      userCounters = reactive(new UserOnlineCounters());

      socketService.on('stat.online', (msg: StatOnlineCountMsg) => {
        if (userCounters == null) {
          return;
        }
        userCounters.online = msg.online;
        userCounters.pc = msg.pc;
        userCounters.mobile = msg.mobile;
        userCounters.guest = msg.guest;
      });
    }

    return {
      ...toRefs(userCounters as any),
    };
  },
});
</script>
<style lang="sass" scoped>
.q-chip
  color: #fff
  background: rgba(0, 0, 0, 0.6)
  user-select: none
  filter: drop-shadow(1px 2px 4px rgba(0, 0, 0, 0.4))

  .q-icon
    color: $light-blue-4

  .count
    padding-left: 4px
    color: #ffc107
    text-align: right
    font-family: digital
    border-radius: 4px
</style>
