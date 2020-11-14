import RoomUser from "../../../online/socket-message/response/RoomUser";
import Room from "../../../online/socket-message/response/Room";

export default class DisplayRoom extends eui.Group {
    room: Room;
    private rect = new egret.Shape();
    private lblName = new eui.Label();
    private lblStatus = new eui.Label();
    private userGroup = new eui.Group();

    constructor(room: Room) {
        super();
        this.room = room;

        let layout = new eui.VerticalLayout();
        layout.paddingTop = 16;
        layout.paddingLeft = 16;
        this.layout = layout;
        this.width = 530;
        this.height = 112;

        this.addChild(this.rect);

        this.drawName(room.name);
        this.addChild(this.lblName);

        this.addChild(this.lblStatus);

        let lblUsersTitle = new eui.Label();
        lblUsersTitle.size = 16;
        lblUsersTitle.text = '玩家：';
        this.addChild(lblUsersTitle);

        this.addChild(this.userGroup);
        this.addUserList(room, room.users);

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            this.drawStatus(room.status);
        }, this);
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
            this.userGroup.removeChildren();
            this.addUserList(newRoom, newRoom.users);
        }

        this.room = newRoom;
    }

    private drawName(name: string) {
        let { lblName } = this;
        lblName.size = 18;
        lblName.text = name;
    }

    private drawStatus(status: number) {
        this.rect.graphics.clear();
        this.rect.graphics.beginFill(0x333333, 0.6);
        this.rect.graphics.drawRoundRect(0, 0, this.width, this.height, 8, 8);

        let { lblStatus } = this;
        lblStatus.size = 16;
        let text = {
            1: '可加入，点击加入' + (this.room.locked ? "(有密码)" : ""),
            2: '即将开始，点击观看',
            3: '进行中，点击观看'}[status];
        if (this.room.spectatorCount > 0) {
            text += `(当前观众${this.room.spectatorCount}个)`;
        }
        this.lblName.textColor = {1: 0x00bb00, 2: 0xff8800, 3: 0xffffff}[status];
        lblStatus.text = text;
    }

    private addUserList(room: Room, users: Array<RoomUser>) {
        if (users == null) {
            return;
        }

        let userGroupLayout = new eui.HorizontalLayout();
        userGroupLayout.gap = 20;
        let { userGroup } = this;
        userGroup.layout = userGroupLayout;

        for (let user of users) {
            let lblUserName = new eui.Label();
            lblUserName.size = 16;
            lblUserName.text =  (user.nickname || user.id.toString())
                + (room.status == 3 ? "" : " " + (user.readyed ? "已准备" : "未准备"));
            userGroup.addChild(lblUserName);
        }
    }
}