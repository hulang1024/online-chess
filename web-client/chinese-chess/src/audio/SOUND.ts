export default class SOUND {
    static soundMap = {};

    static loadAll(): Promise<void> {
        return new Promise((resolve, reject) => {
            let loadedCount = 0;
            const rootPath = 'resource/assets/themes/default/audio';
            const audioNames = ['click.wav', 'select.wav'];
            audioNames.forEach(name => {
                let sound = new egret.Sound();
                sound.addEventListener(egret.Event.COMPLETE, (event: egret.Event) => {
                    this.soundMap[name.substr(0, name.length - 4)] = sound;
                    loadedCount++;
                    if (loadedCount == audioNames.length) {
                        resolve();
                    }
                }, this);
                sound.load(`${rootPath}/${name}`);
            });
        });
    }

    static addSound(id: string, sound: egret.Sound) {
        this.soundMap[id] = sound;
    }

    static get(id: string) {
        return this.soundMap[id];
    }
}