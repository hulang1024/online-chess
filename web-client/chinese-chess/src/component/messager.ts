enum MessageType {
    INFO, SUCCESS, FAIL, ERROR
};

interface MessageOptions {
    msg: string | egret.DisplayObjectContainer;
    duration?: number;
};


let msgCount = 0;

function info(options: MessageOptions | string, context: egret.DisplayObject) {
    message(MessageType.INFO, options, context);
}

function success(options: MessageOptions | string, context: egret.DisplayObject) {
    message(MessageType.SUCCESS, options, context);
}

function fail(options: MessageOptions | string, context: egret.DisplayObject) {
    message(MessageType.FAIL, options, context);
}

function error(options: MessageOptions | string, context: egret.DisplayObject) {
    message(MessageType.ERROR, options, context);
}

function message(type: MessageType, options: MessageOptions | string, context: egret.DisplayObject) {
    let content = null;
    if (typeof options == 'string') {
        options = {msg: options};
    }
    if (typeof options.msg == 'string') {
        let text = new egret.TextField();
        text.wordWrap = true;
        text.multiline = true;
        text.size = 20;
        text.x = 8;
        text.y = 8;
        text.text = <string>options.msg;
        text.textColor = {
            [MessageType.INFO]: 0xffffff,
            [MessageType.SUCCESS]: 0x00ff00,
            [MessageType.FAIL]: 0xff0022,
            [MessageType.ERROR]: 0xff0000
        }[type];
        content = text;
    } else {
        content = options.msg;
    }

    let msgContainer = messageContainer(content, context, msgCount);
    msgContainer.zIndex = 1000;
    context.stage.addChild(msgContainer);
    msgCount++;

    // 定时关闭
    setTimeout(() => {
        if (msgContainer.parent) {
            msgContainer.parent.removeChild(msgContainer);
        }
        msgCount--;
    }, options.duration || 3000);
}

function messageContainer(child: egret.DisplayObject, context: egret.DisplayObject, offset: number) {
    let layout = new eui.HorizontalLayout();
    layout.paddingTop = 8;
    layout.paddingRight = 8;
    layout.paddingBottom = 8;
    layout.paddingLeft = 8;
    
    const width = (child.width || 200) + 16;
    const height = (child.height || 100) + 16;
    let container = new eui.Group();
    container.x = context.stage.stageWidth - width - 8;
    container.y = context.stage.stageHeight - height - 8 - (height + 8) * offset;
    container.layout = layout;

    let shape = new egret.Shape();
    shape.graphics.clear();
    shape.graphics.beginFill(0x000000, 0.5);
    shape.graphics.drawRoundRect(0, 0, width, height, 8, 8);
    container.addChild(shape);
    container.addChild(child);
    return container;
}

export default {
    info,
    success,
    fail,
    error
};