import messager from "../../component/messager";
import socketClient from "../../online/socket";
import platform from "../../Platform";
import AbstractScene from "../AbstractScene";
import PlayScene from "../play/PlayScene";
import SceneContext from "../SceneContext";
import DisplayRoom from "./room/DisplayRoom";
import PasswordForJoinRoomDialog from "./room/PasswordForJoinRoomDialog";
import Room from "../../online/socket-message/response/Room";
import RoomCreateDialog from "./room/RoomCreateDialog";
import SpectatorPlayScene from "../play/SpectatorPlayScene";
import chatOverlay from "../../overlay/chat/chat";

export default class LobbyScene extends AbstractScene {
    private listeners = {};
    private connectHandler: Function;
    private roomContainer = new eui.Group();
    private roomCreateDialog = new RoomCreateDialog();
    private passwordForJoinRoomDialog = new PasswordForJoinRoomDialog();

    constructor(context: SceneContext) {
        super(context);

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
        buttonGroupLayout.paddingTop = 8;
        buttonGroupLayout.paddingLeft = 8;
        buttonGroupLayout.gap = 32;
        let buttonGroup = new eui.Group();
        buttonGroup.layout = buttonGroupLayout;
        let btnCreateRoom = new eui.Button();
        btnCreateRoom.width = 130;
        btnCreateRoom.label = "创建房间";
        btnCreateRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCreateRoomClick, this);
        buttonGroup.addChild(btnCreateRoom);

        let btnQuickMatch = new eui.Button();
        btnQuickMatch.width = 130;
        btnQuickMatch.label = "快速加入";
        btnQuickMatch.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onQuickMatchClick, this);
        buttonGroup.addChild(btnQuickMatch);

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
            this.roomContainer.width = this.stage.stageWidth;
            scroller.height = this.stage.stageHeight / 2 - 30;
            group.addChild(scroller);
            scroller.verticalScrollBar.autoVisibility = false;
            scroller.verticalScrollBar.visible = true;
        }, this);

        (async () => {
            socketClient.addEventListener(egret.Event.CONNECT, this.connectHandler = () => {
                socketClient.send('lobby.enter');
                socketClient.send('lobby.search_rooms');
            }, this);
            socketClient.add('lobby.search_rooms', this.listeners['lobby.search_rooms'] = (msg) => {
                this.roomContainer.removeChildren();
                msg.rooms.forEach(room => {
                    this.addRoom(room);
                });
            });
            socketClient.add('stat.online', this.listeners['stat.online'] = (msg) => {
                lblOnlineNum.text = msg.online;
            });
            socketClient.add('room.create', this.listeners['room.create'] = (msg) => {
                if (msg.code != 0) {
                    messager.fail({msg: '创建房间失败'}, this);
                    return;
                }
                if (msg.room.ownerUserId == platform.getUserInfo().id) {
                    messager.info('创建房间成功', this);
                }
                this.addRoom(msg.room);
            });
            socketClient.add('lobby.room_update', this.listeners['lobby.room_update'] = (msg) => {
                if (msg.code != 0) {
                    return;
                }
                let room = <DisplayRoom>this.roomContainer.$children
                    .filter(room => (<DisplayRoom>room).room.id == msg.room.id)[0];
                room.update(msg.room);
            });
            socketClient.add('lobby.room_remove', this.listeners['lobby.room_remove'] = (msg) => {
                if (msg.code != 0) {
                    return;
                }
                let room = <DisplayRoom>this.roomContainer.$children
                    .filter(room => (<DisplayRoom>room).room.id == msg.roomId)[0];
                this.roomContainer.removeChild(room);
            });
            socketClient.add('room.join', this.listeners['room.join'] = (msg) => {
                switch (msg.code) {
                    case 2:
                        messager.fail('加入房间失败：该房间已不存在', this);
                        return;
                    case 3:
                        messager.fail('加入房间失败：房间已满', this);
                        return;
                    case 4:
                        messager.fail('加入房间失败：你已加入本房间', this);
                        return;
                    case 5:
                        messager.fail('加入房间失败：你已加入其它房间', this);
                        return;
                    case 6:
                        messager.fail('加入房间失败：密码错误', this);
                        return;
                }
                this.pushScene((context) => new PlayScene(context, msg));
            });

            await socketClient.connect();
            
            socketClient.send('lobby.enter');
            socketClient.send('lobby.search_rooms');
        })();

        chatOverlay.show();
    }

    onSceneExit() {
        for (let key in this.listeners) {
            socketClient.signals[key].remove(this.listeners[key]);
        }
        socketClient.removeEventListener(egret.Event.CONNECT, this.connectHandler, this);
        socketClient.send('lobby.exit');
    }

    onCreateRoomClick() {
        this.setChildIndex(this.roomCreateDialog, 1000);
        this.roomCreateDialog.visible = true;
        this.roomCreateDialog.onOkClick = (room) => {
            this.roomCreateDialog.visible = false;
            socketClient.send('room.create', {
                roomName: room.name,
                password: room.password
            });
        }
    }

    onQuickMatchClick() {
        socketClient.send('lobby.quick_match');
        socketClient.addOnce('lobby.quick_match', (msg) => {
            if (msg.code != 0) {
                messager.fail('快速加入失败，因为' + {2: '你已加入其它房间', 3: '没有可进入的房间'}[msg.code] || '未知', this);
                return;
            }
            // 成功会有加入房间事件消息，其它地方已处理
        });
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
            if (room.locked) {
                this.setChildIndex(this.passwordForJoinRoomDialog, 1000);
                this.passwordForJoinRoomDialog.showFor(room);
                this.passwordForJoinRoomDialog.onOkClick = (password) => {
                    this.passwordForJoinRoomDialog.visible = false;
                    socketClient.send('room.join', {roomId: room.id, password});
                }
            } else {
                socketClient.send('room.join', {roomId: room.id});
            }
        } else {
            socketClient.send('spectator.spectate', {roomId: room.id});
            socketClient.addOnce('spectator.room_round_state', (msg: any) => {
                if (msg.code != 0) {
                    messager.info('失败', this);
                    return;
                }
                this.pushScene((context) => new SpectatorPlayScene(context, msg));
            });
        }
    }

}