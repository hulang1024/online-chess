import Room from "../../../online/room/Room";

export default class DisplayRoom extends eui.Group {
    room: Room;
    private rectStatus = new egret.Shape();
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
        this.height = 122;

        this.addChild(this.rect);
        this.addChild(this.rectStatus);

        this.drawName(room.name);
        this.addChild(this.lblName);

        this.addChild(this.lblStatus);

        let lblUsersTitle = new eui.Label();
        lblUsersTitle.size = 18;
        lblUsersTitle.text = '玩家：';
        this.addChild(lblUsersTitle);

        this.addChild(this.userGroup);
        this.addUserList(room);

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
            let oldUsers = [this.room.blackChessUser, this.room.redChessUser].filter(Boolean);
            let oldUserReadied = [this.room.blackReadied, this.room.redReadied].filter(Boolean);
            let newUsers = [newRoom.blackChessUser, newRoom.redChessUser].filter(Boolean);
            let newUserReadied = [newRoom.blackReadied, newRoom.redReadied].filter(Boolean);
            for (let i = 0; i < oldUsers.length; i++) {
                if ((oldUsers[i].id != newUsers[i].id) ||
                    (oldUserReadied[i] != newUserReadied[i])) {
                    same = false;
                    break;
                }
            }
        }

        if (!same) {
            this.userGroup.removeChildren();
            this.addUserList(newRoom);
        }

        this.room = newRoom;
    }

    private drawName(name: string) {
        let { lblName } = this;
        lblName.size = 20;
        lblName.text = name;
    }

    private drawStatus(status: number) {
        let statusColor = {1: 0x22dd00, 2: 0xff8800, 3: 0xffffff}[status];

        this.rect.graphics.clear();
        this.rect.graphics.beginFill(0x000000, 0.3);
        this.rect.graphics.drawRoundRect(0, 0, this.width, this.height, 10, 10);

        this.rect.filters = [
            new egret.DropShadowFilter(
                2, 45, 0x000000, 0.5, 4, 4, 2,
                egret.BitmapFilterQuality.MEDIUM, false, false)
        ];

        this.rectStatus.graphics.beginFill(statusColor, 0.8);
        this.rectStatus.graphics.drawRoundRect(0, 0, 6, this.height, 0, 0);
        let mask = new egret.Shape();
        mask.graphics.beginFill(0xffffff, 1);
        mask.graphics.drawRoundRect(0, 0, 12, this.height, 10, 10);
        mask.graphics.endFill();
        this.addChild(mask);
        this.rectStatus.mask = mask;
        this.rectStatus.graphics.endFill();

        let { lblStatus } = this;
        lblStatus.size = 18;
        lblStatus.textColor = statusColor;
        let text = {
            1: '可加入，点击加入' + (this.room.locked ? "(有密码)" : ""),
            2: '即将开始，点击观看',
            3: '进行中，点击观看'}[status];
        if (this.room.spectatorCount > 0) {
            text += `(当前观众${this.room.spectatorCount}个)`;
        }
        lblStatus.text = text;
    }

    private addUserList(room: Room) {
        let userGroupLayout = new eui.HorizontalLayout();
        userGroupLayout.gap = 20;
        let { userGroup } = this;
        userGroup.layout = userGroupLayout;
        let users = [room.blackChessUser, room.redChessUser].filter(Boolean);
        let readyStates = [room.blackReadied, room.redReadied];
        for (let i = 0; i < users.length; i++) {
            let lblUserName = new eui.Label();
            lblUserName.size = 18;
            lblUserName.text =  (users[i].nickname || users[i].id.toString());
            if (room.status != 3) {
                lblUserName.text += (readyStates[i]
                    ? " 已准备"
                    : users.length == 1 ? "" : " 未准备");
            }
            userGroup.addChild(lblUserName);
        }
    }
}