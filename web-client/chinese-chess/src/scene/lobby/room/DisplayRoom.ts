import RoomUser from "../../../online/socket-message/response/RoomUser";
import Room from "../../../online/socket-message/response/Room";

export default class DisplayRoom extends eui.Component {
    room: Room;
    private rect = new egret.Shape();
    private txtName = new egret.TextField();
    private txtStatus = new egret.TextField();
    private userNameTexts: Array<egret.TextField> = [];

    constructor(room: Room) {
        super();
        this.room = room;

        this.width = 400;
        this.height = 120;

        this.addChild(this.rect);

        this.drawName(room.name);
        this.addChild(this.txtName);

        this.drawStatus(room.status);
        this.addChild(this.txtStatus);

        let txtUserTitle = new egret.TextField();
        txtUserTitle.x = 8;
        txtUserTitle.y = 56;
        txtUserTitle.size = 16;
        txtUserTitle.text = '玩家：';
        this.addChild(txtUserTitle);

        this.addUserList(room, room.users);

    }

    update(newRoom: Room) {
        if (newRoom.name != this.room.name) {
            this.drawName(newRoom.name);
        }
        if (newRoom.status != this.room.status) {
            this.drawStatus(newRoom.status);
        }

        let same = true;
        
        if (newRoom.userCount != this.room.userCount) {
            same = false;
        } else {
            let i = 0;
            while (i < this.room.users.length) {
                if ((newRoom.users[i].id != this.room.users[i].id) ||
                    (newRoom.users[i].readyed != this.room.users[i].readyed)) {
                    same = false;
                    break;
                }
                i++;
            }
        }

        if (!same) {
            this.userNameTexts.forEach(this.removeChild.bind(this));
            this.userNameTexts.length = 0;
            this.addUserList(newRoom, newRoom.users);
        }

        this.room = newRoom;
    }

    private drawName(name: string) {
        let { txtName } = this;
        txtName.x = 8;
        txtName.y = 8;
        txtName.size = 16;
        txtName.text = name;
    }

    private drawStatus(status: number) {
        this.rect.graphics.clear();
        this.rect.graphics.beginFill({1: 0x00bb00, 2: 0xff8800, 3: 0x555555}[status]);
        this.rect.graphics.drawRoundRect(0, 0, this.width, 120, 8, 8);

        let { txtStatus } = this;
        txtStatus.x = 8;
        txtStatus.y = 28;
        txtStatus.size = 16;
        let text = {
            1: '可加入，点击进入' + (this.room.locked ? "(有密码)" : ""),
            2: '即将开始，点击围观',
            3: '进行中，点击围观'}[status];
        if (this.room.spectatorCount > 0) {
            text += `(当前观众${this.room.spectatorCount}个)`;
        }
        txtStatus.text = text;
    }

    private addUserList(room: Room, users: Array<RoomUser>) {
        if (users == null) {
            return;
        }

        let yFactor = 1;
        for (let user of users) {
            let txtUserName = new egret.TextField();
            txtUserName.x = 8;
            txtUserName.y = 56 + yFactor++ * 20;
            txtUserName.size = 16;
            txtUserName.text =  (user.nickname || user.id.toString())
                + (room.status == 3 ? "" : " " + (user.readyed ? "已准备" : "未准备"));
            this.addChild(txtUserName);
            this.userNameTexts.push(txtUserName);
        }
    }
}