import SearchUserInfo from "./SearchUserInfo";
import UserCard from "./UserCard";

export default class UserCardGrid extends eui.UILayer {
    public page: number = 1;
    public onUserTap: Function;
    private container = new eui.Group();

    constructor() {
        super();

        let layout = new eui.TileLayout();
        layout.horizontalGap = 8;
        layout.verticalGap = 8;
        layout.columnAlign = eui.ColumnAlign.JUSTIFY_USING_WIDTH;
        //layout.rowAlign = eui.RowAlign.JUSTIFY_USING_HEIGHT;
        layout.requestedColumnCount = 2;
        this.container.layout = layout;

        let scroller = new eui.Scroller();
        scroller.viewport = this.container;

        this.addEventListener(egret.Event.ADDED_TO_STAGE, () => {
            scroller.height = this.stage.stageHeight / 2 - 12;
            this.addChild(scroller);
        }, this);
    }

    public loadUsers(users: SearchUserInfo[]) {
        this.container.removeChildren();
        users.forEach(user => {
            let userCard = new UserCard(user);
            userCard.onAction = () => {
                this.onUserTap(user);
            };
            this.container.addChild(userCard);
        });
    }
}