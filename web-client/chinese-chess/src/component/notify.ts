import messager from "./messager";

export default async function notify(msg: string, context: egret.DisplayObject) {
    if (!('Notification' in window)) {
        messager.info(msg, context);
        return;
    }

    await new Promise((resolve, reject) => {
        if (Notification.permission == 'granted') {
            resolve();
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission(
                function(permission) {
                    if (permission == 'granted') {
                        resolve();
                    } else {
                        reject();
                    }
                });
        } else {
            reject();
        }
    });

    let options = {
        body: msg
    };
    var notification = new Notification('中国象棋-通知', options);
    return notification;
}