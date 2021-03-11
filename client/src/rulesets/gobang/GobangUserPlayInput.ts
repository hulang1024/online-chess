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

export enum InputMethod {
  /** 普通模式，只需点击一次  */
  NORMAL = 1,
  /** 此模式特别针对手机端可能屏幕太小可能会误触。用户需要点击两次相同位置才确定落子位置 */
  CONFIRM = 2,
  /** 控制器  */
  GAMEPAD = 3,
}

export default class GobangUserPlayInput extends UserPlayInput {
  public _method: InputMethod;

  public mouseChessTarget: MouseChessTarget;

  private chessboard: GobangDrawableChessboard;

  private gameplayServer = new GobangGameplayServer();

  private lastChessPos: ChessPos | null = null;

  constructor(
    gameRule: GameRule,
    gameState: Bindable<GameState>,
    localUser: GameUser,
    isWatchingMode: boolean,
  ) {
    super(gameRule, gameState, localUser, isWatchingMode);

    this.chessboard = (gameRule as GobangGameRule).getChessboard();
    this.mouseChessTarget = new MouseChessTarget(this.chessboard);
    this.chessboard.clicked.add(this.checkReject.bind(this));
    this.chessboard.onChessPosClick = this.onChessPosClick.bind(this);

    if (isWatchingMode) {
      return;
    }

    this.chessboard.onChessPosHover = (pos: ChessPos) => {
      this.onChessPosInputChange(pos);
    };

    this.chessboard.el.addEventListener('mouseleave', () => {
      if (!this.enabled) {
        return;
      }
      if (this.method != InputMethod.GAMEPAD) {
        this.lastChessPos = null;
        this.mouseChessTarget.hide();
        this.gameplayServer.pushChessTargetPos(null, this.localUser.chess.value);
      }
    });

    this.localUser.status.changed.add((status: UserStatus) => {
      if (!this.enabled) {
        return;
      }
      if (status == UserStatus.AFK) {
        if (this.method == InputMethod.NORMAL) {
          this.lastChessPos = null;
          this.mouseChessTarget.hide();
        }

        this.gameplayServer.pushChessTargetPos(null, this.localUser.chess.value);
      }
    });

    let useInputMode = configManager.get(ConfigItem.gobangInputMethod) as InputMethod;
    if (!useInputMode) {
      // eslint-disable-next-line
      if (device.mobile()) {
        if (this.chessboard.sizes.cellSize < 40) {
          useInputMode = InputMethod.GAMEPAD;
        } else {
          useInputMode = InputMethod.CONFIRM;
        }
      } else {
        useInputMode = InputMethod.NORMAL;
      }
    }
    this.method = useInputMode;

    this.gameRule.activeChessHost.addAndRunOnce((activeChessHost) => {
      if (activeChessHost == this.localUser.chess.value) {
        this.mouseChessTarget.setChess(this.localUser.chess.value);
      }
    });
  }

  public onChessPosClick(pos: ChessPos) {
    if (!this.enabled) {
      this.checkReject();
      return;
    }

    if (!(this.gameRule as GobangGameRule).chessboardState.isEmpty(pos)) {
      return;
    }

    if (this.method == InputMethod.CONFIRM) {
      if (!this.lastChessPos || !this.lastChessPos.equals(pos)) {
        this.lastChessPos = pos;
        this.mouseChessTarget.show(pos);
        return;
      }
    } else if (this.method == InputMethod.GAMEPAD) {
      if (!this.lastChessPos || !this.lastChessPos.equals(pos)) {
        this.lastChessPos = pos;
        this.mouseChessTarget.show(pos);
      }
      // eslint-disable-next-line
      (this.gamepad as any).visible = true;
      return;
    }
    this.mouseChessTarget.hide(true);

    const action = new ChessAction();
    action.pos = pos;
    action.chess = this.localUser.chess.value;
    (this.gameRule as GobangGameRule).onChessAction(action);
    this.gameplayServer.putChess(action.pos, action.chess);
    this.lastChessPos = null;
  }

  public get method() {
    return this._method;
  }

  public set method(newMethod: InputMethod) {
    if (newMethod != InputMethod.GAMEPAD && this._method == InputMethod.GAMEPAD) {
      // eslint-disable-next-line
      (this.gamepad as any).visible = false;
    }

    switch (newMethod) {
      case InputMethod.NORMAL:
      case InputMethod.CONFIRM:
        this.mouseChessTarget.hide();
        this.lastChessPos = null;
        break;
      case InputMethod.GAMEPAD:
        if (this.enabled && this.lastChessPos) {
          // eslint-disable-next-line
          (this.gamepad as any).visible = true;
        }
        break;
      default:
        break;
    }

    configManager.set(ConfigItem.gobangInputMethod, newMethod);
    configManager.save();

    this._method = newMethod;
  }

  public enable() {
    super.enable();
  }

  public disable() {
    super.disable();
    this.mouseChessTarget.hide();
    if (this._method == InputMethod.GAMEPAD) {
      // eslint-disable-next-line
      (this.gamepad as any).visible = false;
    }
  }

  public setPlayerView(playerView: Vue) {
    super.setPlayerView(playerView);

    if (this.isWatchingMode) {
      return;
    }
    (playerView.$el as HTMLElement).addEventListener('click', (event: MouseEvent) => {
      if (!this.enabled) {
        return;
      }

      const target: HTMLElement | null = event.target as HTMLElement;

      // 点击了棋盘
      if (target.parentElement?.classList.contains('chessboard')) {
        return;
      }

      if (this.method == InputMethod.GAMEPAD) {
        // 点击了其它
        if (target && target.classList.contains('q-page')) {
          // eslint-disable-next-line
          (this.gamepad as any).visible = false;
          this.mouseChessTarget.hide();
        }
      }
    });
  }

  public setGamepad(gamepad: Vue) {
    super.setGamepad(gamepad);

    [
      { key: 'up', offset: [0, -1] },
      { key: 'down', offset: [0, +1] },
      { key: 'left', offset: [-1, 0] },
      { key: 'right', offset: [+1, 0] },
    ].forEach(({ key, offset: [dx, dy] }) => {
      gamepad.$on(key, () => {
        if (!this.lastChessPos) {
          return;
        }
        const newChessPos = new ChessPos(
          this.lastChessPos.row + dy,
          this.lastChessPos.col + dx,
        );
        const { chessboardState } = (this.gameRule as GobangGameRule);
        if (chessboardState.isValid(newChessPos)) {
          this.lastChessPos = newChessPos;
          this.onChessPosInputChange(newChessPos);
        }
      });
    });
    gamepad.$on('ok', () => {
      if (!this.lastChessPos) {
        return;
      }
      this.mouseChessTarget.hide(true);
      const action = new ChessAction();
      action.pos = this.lastChessPos;
      action.chess = this.localUser.chess.value;
      (this.gameRule as GobangGameRule).onChessAction(action);
      this.gameplayServer.putChess(action.pos, action.chess);
      this.lastChessPos = null;
    });
  }

  private onChessPosInputChange(pos: ChessPos) {
    if (!this.enabled) {
      return;
    }
    const chess = this.localUser.chess.value;
    if ((this.gameRule as GobangGameRule).chessboardState.isEmpty(pos)) {
      this.mouseChessTarget.show(pos);
      this.gameplayServer.pushChessTargetPos(pos, chess);
    } else {
      this.mouseChessTarget.hide();
      this.gameplayServer.pushChessTargetPos(null, chess);
    }
  }
}
