import Room from "./Room";
import RoomPlayer from "./RoomPlayer";

export default class DisplayRoom extends eui.Component {
    room: Room;
    private rect = new egret.Shape();
    private txtName = new egret.TextField();
    private txtStatus = new egret.TextField();
    private players: Array<egret.TextField> = [];

    constructor(room: Room) {
        super();
        this.room = room;

        this.width = 200;
        this.height = 120;

        this.addChild(this.rect);

        this.drawName(room.name);
        this.addChild(this.txtName);

        this.drawStatus(room.status);
        this.addChild(this.txtStatus);

        let txtPlayerTitle = new egret.TextField();
        txtPlayerTitle.x = 8;
        txtPlayerTitle.y = 56;
        txtPlayerTitle.size = 16;
        txtPlayerTitle.text = '玩家：';
        this.addChild(txtPlayerTitle);

        this.addPlayerList(room, room.players);

    }

    update(newRoom: Room) {
        if (newRoom.name != this.room.name) {
            this.drawName(newRoom.name);
        }
        if (newRoom.status != this.room.status) {
            this.drawStatus(newRoom.status);
        }

        let same = true;
        
        if (newRoom.playerCount != this.room.playerCount) {
            same = false;
        } else {
            let i = 0;
            while (i < this.room.players.length) {
                if ((newRoom.players[i].id != this.room.players[i].id) ||
                    (newRoom.players[i].readyed != this.room.players[i].readyed)) {
                    same = false;
                    break;
                }
                i++;
            }
        }

        if (!same) {
            this.players.forEach(this.removeChild.bind(this));
            this.players.length = 0;
            this.addPlayerList(newRoom, newRoom.players);
        }

        this.room = newRoom;
    }

    private drawName(name: string) {
        let { txtName } = this;
        txtName.x = 8;
        txtName.y = 8;
        txtName.size = 16;
        txtName.text = '房间' + name;
    }

    private drawStatus(status: number) {
        this.rect.graphics.clear();
        this.rect.graphics.beginFill({1: 0x00ff00, 2: 0xff8800, 3: 0x555555}[status], 0.9);
        this.rect.graphics.drawRoundRect(0, 0, 200, 120, 8, 8);

        let { txtStatus } = this;
        txtStatus.x = 8;
        txtStatus.y = 28;
        txtStatus.size = 16;
        txtStatus.text = {1: '可加入', 2: '即将开始', 3: '进行中'}[status];
    }

    private addPlayerList(room: Room, players: Array<RoomPlayer>) {
        if (players == null) {
            return;
        }

        let yFactor = 1;
        for (let player of players) {
            let txtPlayer = new egret.TextField();
            txtPlayer.x = 8;
            txtPlayer.y = 56 + yFactor++ * 20;
            txtPlayer.size = 16;
            txtPlayer.text =  (player.nickname || player.id.toString())
                + (room.status == 3 ? "" : " " + (player.readyed ? "已准备" : "未准备"));
            this.addChild(txtPlayer);
            this.players.push(txtPlayer);
        }
    }
}