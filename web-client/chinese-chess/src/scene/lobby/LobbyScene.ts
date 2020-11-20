import messager from "../../component/messager";
import socketClient from "../../online/socket";
import platform from "../../Platform";
import AbstractScene from "../AbstractScene";
import PlayScene from "../play/PlayScene";
import SceneContext from "../SceneContext";
import DisplayRoom from "./room/DisplayRoom";
import PasswordForJoinRoomDialog from "./room/PasswordForJoinRoomDialog";
import Room from "../../online/room/Room";
import RoomCreateDialog from "./room/RoomCreateDialog";
import SpectatorPlayScene from "../play/SpectatorPlayScene";
import ChannelManager from "../../online/chat/ChannelManager";
import CreateRoomRequest from "../../online/room/CreateRoomRequest";
import GetRoomsRequest from "../../online/room/GetRoomsRequest";
import JoinRoomRequest from "../../online/room/JoinRoomRequest";
import QuickStartRequest from "../../online/room/QuickStartRequest";
import SpectateRequest from "../../online/spectator/SpectateRequest";

export default class LobbyScene extends AbstractScene {
    private listeners = {};
    private channelManager: ChannelManager;
    private reconnectHandler: Function;
    private roomContainer = new eui.Group();
    private roomCreateDialog = new RoomCreateDialog();
    private passwordForJoinRoomDialog = new PasswordForJoinRoomDialog();

    constructor(context: SceneContext, channelManager: ChannelManager) {
        super(context);

        this.channelManager = channelManager;

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 8;
        let group = new eui.Group();
        group.layout = layout;
        this.addChild(group);

        let headGroup = new eui.Group();
        headGroup.layout = new eui.HorizontalLayout();
        (<eui.HorizontalLayout>headGroup.layout).gap = 4;
  
        let lblTitle = new eui.Label();
        lblTitle.size = 24;
        lblTitle.text = "多人游戏大厅";
        headGroup.addChild(lblTitle);

        let lblOnline = new eui.Label();
        lblOnline.size = 20;
        lblOnline.text = "在线人数:";
        headGroup.addChild(lblOnline);
        let lblOnlineNum = new eui.Label();
        lblOnlineNum.size = 20;
        headGroup.addChild(lblOnlineNum);

        group.addChild(headGroup);

        let buttonGroupLayout = new eui.HorizontalLayout();
        buttonGroupLayout.horizontalAlign = egret.HorizontalAlign.JUSTIFY;
        buttonGroupLayout.paddingTop = 8;
        buttonGroupLayout.paddingRight = 8;
        buttonGroupLayout.paddingBottom = 8;
        buttonGroupLayout.paddingLeft = 8;
        let buttonGroup = new eui.Group();
        buttonGroup.layout = buttonGroupLayout;

        let btnQuickMatch = new eui.Button();
        btnQuickMatch.width = 120;
        btnQuickMatch.label = "快速加入";
        btnQuickMatch.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onQuickMatchClick, this);
        buttonGroup.addChild(btnQuickMatch);
        
        let btnCreateRoom = new eui.Button();
        btnCreateRoom.width = 120;
        btnCreateRoom.label = "创建棋桌";
        btnCreateRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCreateRoomClick, this);
        buttonGroup.addChild(btnCreateRoom);
        group.addChild(buttonGroup);

        let roomLayout = new eui.VerticalLayout();
        roomLayout.horizontalAlign = egret.HorizontalAlign.CONTENT_JUSTIFY;
        roomLayout.gap = 8;
        roomLayout.paddingTop = 16;
        roomLayout.paddingRight = 8;
        roomLayout.paddingLeft = 8 ;
        roomLayout.paddingBottom = 8;
        this.roomContainer.layout = roomLayout;
        
        this.addChild(this.roomCreateDialog);
        this.addChild(this.passwordForJoinRoomDialog);

        let scroller = new eui.Scroller();
        scroller.viewport = this.roomContainer;

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            buttonGroup.width = this.stage.stageWidth;
            this.roomContainer.width = this.stage.stageWidth;
            scroller.height = this.stage.stageHeight;
            group.addChild(scroller);
            
            this.context.chatOverlay.popIn();
        }, this);

        (async () => {
            this.listeners['stat.online'] = (msg) => {
                lblOnlineNum.text = msg.online;
            };
            this.listeners['lobby.room_create'] = (msg) => {
                this.addRoom(msg.room);
            };
            this.listeners['lobby.room_update'] = (msg) => {
                if (msg.code != 0) {
                    return;
                }
                let room = <DisplayRoom>this.roomContainer.$children
                    .filter(room => (<DisplayRoom>room).room.id == msg.room.id)[0];
                room.update(msg.room);
            };
            this.listeners['lobby.room_remove'] = (msg) => {
                if (msg.code != 0) {
                    return;
                }
                let room = <DisplayRoom>this.roomContainer.$children
                    .filter(room => (<DisplayRoom>room).room.id == msg.roomId)[0];
                this.roomContainer.removeChild(room);
            };

            for (let key in this.listeners) {
                socketClient.add(key, this.listeners[key]);
            }

            let getRoomsRequest = new GetRoomsRequest();
            getRoomsRequest.success = (rooms) => {
                this.roomContainer.removeChildren();
                rooms.forEach((room: Room) => {
                    this.addRoom(room);
                });
            };
            getRoomsRequest.perform();

            socketClient.reconnectedSignal.add(this.reconnectHandler = () => {
                socketClient.send('lobby.enter');
                getRoomsRequest.perform();
            });

            await socketClient.connect();
            
            socketClient.send('lobby.enter');
        })();
    }

    onSceneExit() {
        super.onSceneExit();
        
        for (let key in this.listeners) {
            socketClient.signals[key].remove(this.listeners[key]);
        }
        socketClient.reconnectedSignal.remove(this.reconnectHandler);
        socketClient.send('lobby.exit');
        this.context.chatOverlay.popOut();
    }

    onCreateRoomClick() {
        this.setChildIndex(this.roomCreateDialog, 1000);
        this.roomCreateDialog.visible = true;
        this.roomCreateDialog.onOkClick = (room: Room) => {
            this.roomCreateDialog.visible = false;

            let createRoomRequest = new CreateRoomRequest(room);
            createRoomRequest.success = (room) => {
                this.addRoom(room);
                this.pushScene((context) => new PlayScene(context, room, this.channelManager));
            };
            createRoomRequest.failure = () => {
                messager.fail({msg: '创建棋桌失败'}, this);
            };
            createRoomRequest.perform();
        }
    }

    onQuickMatchClick() {
        let quickStartRequest = new QuickStartRequest();
        quickStartRequest.success = (room) => {
            this.addRoom(room);
            this.pushScene((context) => new PlayScene(context, room, this.channelManager));
        };
        quickStartRequest.failure = () => {
            messager.fail('快速加入失败', this);
        };
    }

    private addRoom(room: Room) {
        let displayRoom = new DisplayRoom(room);
        displayRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, (event: egret.TouchEvent) => {
            this.onJoinRoomClick(displayRoom);
        }, this);
        this.roomContainer.addChild(displayRoom);
    }

    private onJoinRoomClick(displayRoom: DisplayRoom) {
        let room = displayRoom.room;
        if (room.userCount == 1) {
            let paramRoom = new Room();
            paramRoom.id = room.id;
            if (room.locked) {
                this.setChildIndex(this.passwordForJoinRoomDialog, 1000);
                this.passwordForJoinRoomDialog.showFor(room);
                this.passwordForJoinRoomDialog.onOkClick = (password: string) => {
                    this.passwordForJoinRoomDialog.visible = false;
                    paramRoom.password = password;
                }
            }

            let joinRoomRequest = new JoinRoomRequest(room);
            joinRoomRequest.success = (result) => {
                this.pushScene((context) => new PlayScene(context, result.room, this.channelManager));
            };

            joinRoomRequest.failure = (result) => {
                switch (result.code) {
                    case 2:
                        messager.fail('加入棋桌失败：该棋桌已不存在', this);
                        return;
                    case 3:
                        messager.fail('加入棋桌失败：棋桌已满', this);
                        return;
                    case 4:
                        messager.fail('加入棋桌失败：你已加入本棋桌', this);
                        return;
                    case 5:
                        messager.fail('加入棋桌失败：你已加入其它棋桌', this);
                        return;
                    case 6:
                        messager.fail('加入棋桌失败：密码错误', this);
                        return;
                }
            }
            joinRoomRequest.perform();
        } else {
            let spectateRequest = new SpectateRequest(room);
            spectateRequest.success = (states) => {
                this.pushScene((context) => new SpectatorPlayScene(context, states, this.channelManager));
            };
            spectateRequest.failure = () => {
                messager.info('观看请求失败', this);
            };
        }
    }

}