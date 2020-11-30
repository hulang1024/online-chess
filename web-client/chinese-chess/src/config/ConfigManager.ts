
export enum ConfigItem {
    username = 'username',
    password = 'password',
    token = 'token',
    loginAuto = 'loginAuto'
}

export default class ConfigManager {
    store = {};
    loaded: boolean = false;

    constructor() {
        this.initDefaults();
        this.load();
        this.loaded = true;
    }

    public load() {
        if (this.loaded) return;

        ['username', 'password', 'token', 'loginAuto'].forEach(key => {
            let val = localStorage.getItem(key);
            if (val == null) {
                return;
            }

            val = JSON.parse(val);
            this.set(key, val);
        });
    }

    public save() {
        for (let key in this.store) {
            localStorage.setItem(key, JSON.stringify(this.store[key]));
        }
    }

    public set(key: string, value: any) {
        this.store[key] = value;
    }

    public get(key: string) {
        return this.store[key];
    }

    private initDefaults() {
        this.set(ConfigItem.username, '');
        this.set(ConfigItem.password, '');
        this.set(ConfigItem.token, '');
        this.set(ConfigItem.loginAuto, true);
    }
}