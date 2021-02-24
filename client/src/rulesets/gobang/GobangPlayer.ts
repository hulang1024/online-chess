import RulesetPlayer from "../RulesetPlayer";
import GobangUserPlayInput from "./GobangUserPlayInput";

export default class GobangPlayer extends RulesetPlayer {
  public openSettings() {
    const userPlayInput = this.userPlayInput as GobangUserPlayInput;
    this.context.$q.dialog({
      title: '选择落子模式',
      options: {
        type: 'radio',
        model: userPlayInput.mode.toString(),
        items: [
          { label: '点击一次确定落子位置', value: '1' },
          { label: '连续点击两次相同位置确定落子位置', value: '2' },
        ],
      },
      ok: {
        label: '确定',
        color: 'primary',
      },
      cancel: {
        label: '取消',
        color: 'warning',
      },
    }).onOk((opt: number) => {
      userPlayInput.mode = +opt;
    });
  }
}
