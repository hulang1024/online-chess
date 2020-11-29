import messager from "../../component/messager";
import APIAccess from "../../online/api/APIAccess";
import AddAsFriendRequest from "../../online/friend/AddAsFriendRequest";
import DeleteFriendRequest from "../../online/friend/DeleteFriendRequest";
import SpectateUserRequest from "../../online/spectator/SpectateUserRequest";
import GetUsersRequest from "../../online/user/GetUsersRequest";
import PlayScene from "../../scene/play/PlayScene";
import SpectatorPlayScene from "../../scene/play/SpectatorPlayScene";
import SceneContext from "../../scene/SceneContext";
import Bindable from "../../utils/bindables/Bindable";
import MenuOption from "../menu/MenuOption";
import OptionMenuOverlay from "../menu/OptionMenuOverlay";
import Overlay from "../Overlay";
import UserPanel from "../user/UserPanel";
import SearchUserInfo from "./SearchUserInfo";
import UserCardGrid from "./UserCardGrid";

export default class SocialBrowser extends Overlay {
    private api: APIAccess;
    private context: SceneContext;
    private tabContents: UserCardGrid[] = [];
    private optionMenuOverlay: OptionMenuOverlay;
    private userPanel: UserPanel;
    private selectedUser: SearchUserInfo;
    private onlineCount: Bindable<number> = new Bindable<number>();

    constructor(context: SceneContext) {
        super(false, false, 0.5);
        this.context = context;
        this.api = context.api;

        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.load, this);
    }

    load() {
        this.visible = false;
        this.y = this.context.toolbar.height;
        this.setSize(this.stage.stageWidth, this.stage.stageHeight / 2 + 84);

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 8;
        layout.paddingRight = 8;
        layout.paddingLeft = 8;
        layout.paddingBottom = 8;
        this.layout = layout;

        let group = new eui.Group();
        group.layout = new eui.HorizontalLayout();
        this.addChild(group);
        let lblOnline = new eui.Label();
        lblOnline.size = 22;
        lblOnline.text = "在线人数:";
        group.addChild(lblOnline);
        let lblOnlineNum = new eui.Label();
        lblOnlineNum.size = 22;
        group.addChild(lblOnlineNum);

        this.onlineCount.changed.add((count: number) => {
            lblOnlineNum.text = count + '';
        });

        let viewStack = new eui.ViewStack();
        ['排名','好友'].forEach(name => {
            let tabContent = new UserCardGrid();
            tabContent.name = name;
            tabContent.onUserTap = (user: SearchUserInfo) => {
                if (!this.api.isLoggedIn.value) {
                    messager.info('请先登录', this);
                    return;
                }
                this.selectedUser = user;
                
                let isMe = this.api.localUser.id == this.selectedUser.id;
                
                if (!this.optionMenuOverlay) {
                    this.stage.addChild(this.optionMenuOverlay = new OptionMenuOverlay());
                }
                this.optionMenuOverlay.showOptions([
                    viewOption,
                    !isMe && user.isOnline && chatOption,
                    !isMe && !user.isFriend && addAsFriendOption,
                    !isMe && user.isFriend && deleteFriendOption,
                    !isMe && user.isOnline && spectateOption
                ].filter(Boolean));
            };
            this.tabContents.push(tabContent);
            viewStack.addChild(tabContent);
        });

        let tabBar = new eui.TabBar();
        tabBar.dataProvider = viewStack;
        tabBar.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onTabSelected, this);
        this.addChild(tabBar);
        this.addChild(viewStack);
        
        let viewOption = new MenuOption();
        viewOption.label = "查看详情";
        viewOption.onTap = () => {
            if (!this.userPanel) {
                this.stage.addChild(this.userPanel = new UserPanel(this.context));
            }
            this.userPanel.showUser(this.selectedUser);
        };

        let chatOption = new MenuOption();
        chatOption.label = "聊天";
        chatOption.onTap = () => {
            this.context.channelManager.openPrivateChannel(this.selectedUser);
            this.hide();
        };

        let spectateOption = new MenuOption();
        spectateOption.label = '观看游戏';
        spectateOption.onTap = () => {
            let req = new SpectateUserRequest(this.selectedUser);
            req.success = (res) => {
                this.hide();
                let currentScene = this.context.sceneManager.currentScene;
                if (currentScene instanceof SpectatorPlayScene || currentScene instanceof PlayScene) {
                    this.context.sceneManager.replaceScene(
                        (context) => new SpectatorPlayScene(context, res));
                } else {
                    this.context.sceneManager.pushScene(
                        (context) => new SpectatorPlayScene(context, res));
                }
            };
            req.failure = (res) => {
                let cause = {
                    2: '该用户未在线',
                    3: '该用户未加入游戏',
                    4: '不满足观看条件',
                    5: '你在游戏中不能观看其它游戏'
                }[res.code] || '原因未知';
                messager.info(`观看请求失败，${cause}`, this);
            };
            this.api.perform(req);
        };

        let addAsFriendOption = new MenuOption();
        addAsFriendOption.label = "加为好友";
        addAsFriendOption.onTap = () => {
            let request = new AddAsFriendRequest(this.selectedUser);
            request.success = () => {
                messager.success(`已将${this.selectedUser.nickname}加为好友`, this);
            }
            this.api.perform(request);
        };

        let deleteFriendOption = new MenuOption();
        deleteFriendOption.label = "删除好友";
        deleteFriendOption.onTap = () => {
            let request = new DeleteFriendRequest(this.selectedUser);
            request.success = () => {
                messager.success(`已删除好友${this.selectedUser.nickname}`, this);
                this.loadTabConent(1);
            }
            this.api.perform(request);
        };

        //todo: 暂时这样实现刷新
        this.context.socketClient.add('stat.online', (msg: any) => {
            this.onlineCount.value = msg.online;
            if (this.visible) {
                this.loadTabConent(tabBar.selectedIndex);
            }
        });
    }

    private onTabSelected(event: eui.ItemTapEvent) {
        this.loadTabConent(event.itemIndex);
    }

    public loadTabConent(index: number) {
        let onlyFriends = index == 1;
        if (onlyFriends && !this.api.isLoggedIn.value) {
            return;
        }
        let tabContent = this.tabContents[index];
        let getUsersRequest = new GetUsersRequest({onlyFriends, page: 1, size: 10});
        getUsersRequest.success = (userPage: any) => {
            tabContent.loadUsers(userPage.records);
        };
        this.api.queue(getUsersRequest);
    }
}