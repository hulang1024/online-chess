import messager from "../../component/messager";
import socketClient from "../../online/socket";
import platform from "../../Platform";
import AbstractScene from "../AbstractScene";
import PlayScene from "../play/PlayScene";
import SceneContext from "../SceneContext";
import DisplayRoom from "./room/DisplayRoom";
import PasswordForJoinRoomDialog from "./room/PasswordForJoinRoomDialog";
import Room from "./room/Room";
import RoomCreateDialog from "./room/RoomCreateDialog";

export default class LobbyScene extends AbstractScene {
    private listeners = {};
    private connectHandler: Function;
    private roomContainer = new eui.Group();
    private roomCreateDialog = new RoomCreateDialog();
    private passwordForJoinRoomDialog = new PasswordForJoinRoomDialog();

    constructor(context: SceneContext) {
        super(context);
        
        let buttonGroupLayout = new eui.HorizontalLayout();
        buttonGroupLayout.paddingTop = 8;
        buttonGroupLayout.paddingLeft = 8;
        buttonGroupLayout.gap = 32;
        let buttonGroup = new eui.Group();
        buttonGroup.layout = buttonGroupLayout;
        let btnCreateRoom = new eui.Button();
        btnCreateRoom.label = "创建房间";
        btnCreateRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCreateRoomClick, this);
        buttonGroup.addChild(btnCreateRoom);

        let btnQuickMatch = new eui.Button();
        btnQuickMatch.x = 120;
        btnQuickMatch.label = "快速加入";
        btnQuickMatch.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onQuickMatchClick, this);
        buttonGroup.addChild(btnQuickMatch);

        this.addChild(buttonGroup);

        let statGroup = new eui.Group();
        statGroup.x = 300;
        statGroup.y = 20;
        let lblOnline = new eui.Label();
        lblOnline.size = 18;
        lblOnline.text = "在线人数:";
        statGroup.addChild(lblOnline);
        let txtOnline = new egret.TextField();
        txtOnline.size = 20;
        txtOnline.x = 80;
        statGroup.addChild(txtOnline);
        this.addChild(statGroup);

        let roomLayout = new eui.TileLayout();
        roomLayout.horizontalGap = 8;
        roomLayout.verticalGap = 8;
        roomLayout.columnAlign = eui.ColumnAlign.JUSTIFY_USING_WIDTH;
        roomLayout.rowAlign = eui.RowAlign.JUSTIFY_USING_HEIGHT;
        roomLayout.paddingTop = 16;
        roomLayout.paddingRight = 8;
        roomLayout.paddingLeft = 8 ;
        roomLayout.paddingBottom = 8;
        this.roomContainer.y = 60;
        this.roomContainer.layout = roomLayout;
        this.addChild(this.roomContainer);


        this.roomCreateDialog.y = 100;
        this.addChild(this.roomCreateDialog);

        this.passwordForJoinRoomDialog.y = 100;
        this.addChild(this.passwordForJoinRoomDialog);

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
                txtOnline.text = msg.online;
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
                this.pushScene((context) => new PlayScene(context, msg.room));
            });

            await socketClient.connect();
            
            socketClient.send('lobby.enter');
            socketClient.send('lobby.search_rooms');
        })();
    }

    onSceneExit() {
        for (let key in this.listeners) {
            socketClient.signals[key].remove(this.listeners[key]);
        }
        socketClient.removeEventListener(egret.Event.CONNECT, this.connectHandler, this);
        socketClient.send('lobby.exit');
    }

    onCreateRoomClick() {
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
            this.onJoinRoomClick(room);
        }, this);
        this.roomContainer.addChild(displayRoom);
    }

    private onJoinRoomClick(room) {
        if (room.locked) {
            this.passwordForJoinRoomDialog.showFor(room);
            this.passwordForJoinRoomDialog.onOkClick = (password) => {
                this.passwordForJoinRoomDialog.visible = false;
                socketClient.send('room.join', {roomId: room.id, password});
            }
        } else {
            socketClient.send('room.join', {roomId: room.id});
        }
    }

}