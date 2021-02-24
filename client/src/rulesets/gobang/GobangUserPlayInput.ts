import device from "current-device";
import GameState from "src/online/play/GameState";
import ChessPos from "src/rulesets/gobang/ChessPos";
import Bindable from "src/utils/bindables/Bindable";
import { configManager } from "src/boot/main";
import { ConfigItem } from "src/config/ConfigManager";
import GameUser from "src/online/play/GameUser";
import UserStatus from "src/user/UserStatus";
import UserPlayInput from "../UserPlayInput";
import GameRule from "../GameRule";
import GobangGameplayServer from "./online/GobangGameplayServer";
import GobangDrawableChessboard from "./ui/GobangDrawableChessboard";
import GobangGameRule from "./GobangGameRule";
import ChessAction from "./ChessAction";
import MouseChessTarget from "./ui/MouseChessTarget";

export enum InputMode {
  /** 普通模式，只需点击一次  */
  NORMAL = 1,
  /** 此模式特别针对手机端可能屏幕太小可能会误触。用户需要点击两次相同位置才确定落子位置 */
  CONFIRM = 2
}

export default class GobangUserPlayInput extends UserPlayInput {
  public _mode: InputMode;

  public mouseChessTarget: MouseChessTarget;

  private chessboard: GobangDrawableChessboard;

  private gameplayServer = new GobangGameplayServer();

  private lastClickChessPos: ChessPos | null = null;

  constructor(
    gameRule: GameRule,
    gameState: Bindable<GameState>,
    localUser: GameUser,
    isWatchingMode: boolean,
  ) {
    super(gameRule, gameState, localUser, isWatchingMode);

    this.chessboard = (gameRule as GobangGameRule).getChessboard();

    this.mouseChessTarget = new MouseChessTarget(this.chessboard);

    if (isWatchingMode) {
      return;
    }

    this.chessboard.onChessPosHover = (pos: ChessPos) => {
      if (!this.enabled) {
        return;
      }
      this.mouseChessTarget.show(pos);
      this.gameplayServer.pushChessTargetPos(pos, this.localUser.chess.value);
    };

    this.chessboard.el.addEventListener('mouseleave', this.onIdle.bind(this));

    this.localUser.status.changed.add((status: UserStatus) => {
      if (status == UserStatus.AFK) {
        this.onIdle();
      }
    });

    this._mode = configManager.get(ConfigItem.gobangInputMode) as InputMode
      // eslint-disable-next-line
      || (device.mobile() ? InputMode.CONFIRM : InputMode.NORMAL);

    this.gameRule.activeChessHost.addAndRunOnce((activeChessHost) => {
      if (activeChessHost == this.localUser.chess.value) {
        this.mouseChessTarget.setChess(this.localUser.chess.value);
      }
    });

    this.chessboard.clicked.add(this.checkReject.bind(this));

    this.chessboard.onChessPosClick = this.onChessPosClick.bind(this);
  }

  public onChessPosClick(pos: ChessPos) {
    if (!this.enabled) {
      this.checkReject();
      return;
    }

    if (!(this.gameRule as GobangGameRule).chessboardState.isEmpty(pos)) {
      return;
    }

    if (this.mode == InputMode.CONFIRM) {
      if (!this.lastClickChessPos || !this.lastClickChessPos.equals(pos)) {
        this.lastClickChessPos = pos;
        this.mouseChessTarget.show(pos);
        return;
      }
    }

    const action = new ChessAction();
    action.pos = pos;
    action.chess = this.localUser.chess.value;
    (this.gameRule as GobangGameRule).onChessAction(action);
    this.gameplayServer.putChess(action.pos, action.chess);
    this.lastClickChessPos = null;
  }

  public get mode() {
    return this._mode;
  }

  public set mode(val: InputMode) {
    this._mode = val;
    configManager.set(ConfigItem.gobangInputMode, val);
    configManager.save();
    if (this._mode == InputMode.NORMAL) {
      this.mouseChessTarget.hide();
      this.lastClickChessPos = null;
    }
  }

  public enable() {
    super.enable();
  }

  public disable() {
    super.disable();
    this.mouseChessTarget.hide();
  }

  public onIdle() {
    if (!this.enabled) {
      return;
    }

    this.mouseChessTarget.hide();
    if (this.lastClickChessPos) {
      this.lastClickChessPos = null;
    }
    this.gameplayServer.pushChessTargetPos(null, this.localUser.chess.value);
  }
}
