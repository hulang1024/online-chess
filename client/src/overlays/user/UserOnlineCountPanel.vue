<template>
  <div class="q-py-xs">
    <q-chip square>
      <span>在线</span>
      <span class="count">{{ online }}</span>
    </q-chip>
    <q-chip square>
      <q-icon name="desktop_windows" />
      <span class="count">{{ pc }}</span>
    </q-chip>
    <q-chip square>
      <q-icon name="phone_iphone" />
      <span class="count">{{ mobile }}</span>
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
<style lang="scss" scoped>
.q-chip {
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  user-select: none;

  .q-icon {
    color: $light-blue-4;
  }

  .count {
    padding-left: 4px;
    color: #ffc107;
  }
}
</style>
