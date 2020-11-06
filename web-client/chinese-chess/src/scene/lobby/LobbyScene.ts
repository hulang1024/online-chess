import socketClient from "../../online/socket";
import platform from "../../Platform";
import AbstractScene from "../AbstractScene";
import PlayScene from "../play/PlayScene";
import SceneContext from "../SceneContext";
import DisplayRoom from "./DisplayRoom";
import Room from "./Room";

export default class LobbyScene extends AbstractScene {
    private listeners = {};
    private roomContainer = new eui.Group();

    constructor(context: SceneContext) {
        super(context);

        this.x = 20;
        this.y = 20;

        let btnCreateRoom = new eui.Button();
        btnCreateRoom.width = 100;
        btnCreateRoom.height = 50;
        btnCreateRoom.label = "创建房间";
        btnCreateRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onCreateRoomClick, this);
        this.addChild(btnCreateRoom);

        let btnQuickMatch = new eui.Button();
        btnQuickMatch.x = 120;
        btnQuickMatch.width = 100;
        btnQuickMatch.height = 50;
        btnQuickMatch.label = "快速加入";
        btnQuickMatch.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onQuickMatchClick, this);
        this.addChild(btnQuickMatch);

        let roomLayout = new eui.TileLayout();
        roomLayout.horizontalGap = 10;
        roomLayout.verticalGap = 10;
        roomLayout.columnAlign = eui.ColumnAlign.JUSTIFY_USING_WIDTH;
        roomLayout.rowAlign = eui.RowAlign.JUSTIFY_USING_HEIGHT;
        roomLayout.paddingTop = 0;
        roomLayout.paddingRight = 30;
        roomLayout.paddingLeft = 0;
        roomLayout.paddingBottom = 10;
        roomLayout.requestedColumnCount = 2;
        this.roomContainer.y = 100;
        this.roomContainer.width = 500;
        this.roomContainer.height = 400;
        this.roomContainer.layout = roomLayout;
        this.addChild(this.roomContainer);

        (async () => {
            await socketClient.connect();
            
            socketClient.send('lobby.enter');
            socketClient.send('lobby.search_rooms');
            socketClient.add('lobby.search_rooms', this.listeners['lobby.search_rooms'] = (msg) => {
                this.roomContainer.removeChildren();
                msg.rooms.forEach(room => {
                    this.addRoom(room);
                });
            });
            socketClient.add('room.create', this.listeners['room.create'] = (msg) => {
                if (msg.code != 0) {
                    alert('创建房间失败');
                    return;
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
                if (msg.code == 2) {
                    alert('该房间已不存在');
                    return;
                }
                if (msg.code == 3) {
                    alert('加入失败');
                    return;
                }
                if (msg.code != 0 && msg.code != 4) {
                    return;
                }
                platform.login(msg.player);
                this.pushScene((context) => new PlayScene(context, msg.room));
            });
        })();
    }

    onSceneExit() {
        for (let key in this.listeners) {
            socketClient.signals[key].remove(this.listeners[key]);
        }
        socketClient.send('lobby.exit');
    }

    onCreateRoomClick() {
        socketClient.send('room.create');
    }

    onQuickMatchClick() {
        socketClient.send('lobby.quick_match');
        socketClient.addOnce('lobby.quick_match', (msg) => {
            if (msg.code != 0) {
                alert('快速加入失败，原因：' + {2: '你已加入其它房间', 3: '没有可进入的房间'}[msg.code] || '未知')
                return;
            }
            // 成功会有加入房间事件消息，其它地方已处理
        });
    }

    private addRoom(room: Room) {
        let displayRoom = new DisplayRoom(room);
        displayRoom.addEventListener(egret.TouchEvent.TOUCH_TAP, (event: egret.TouchEvent) => {
            socketClient.send('room.join', {roomId: room.id});
        }, this);
        this.roomContainer.addChild(displayRoom);
    }

}