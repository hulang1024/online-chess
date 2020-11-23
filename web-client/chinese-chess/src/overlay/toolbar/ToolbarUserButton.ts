import APIAccess from "../../online/api/APIAccess";
import SceneContext from "../../scene/SceneContext";

export default class ToolbarUserButton extends eui.Button {
    api: APIAccess;

    constructor(context: SceneContext) {
        super();
        this.width = 100;
        this.label = "登录";

        this.api = context.api;

        this.api.stateChanged.add(this.onAPIStateChange.bind(this));
    }

    private onAPIStateChange() {
        this.label = this.api.isLoggedIn ? '已登录' : '登录';
    }
}