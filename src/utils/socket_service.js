export default class SocketService {
    // 单例
    // static instance = null
    // static  Instance (){
    //     if (!this.instance) {
    //         this.instance = new SocketService()
    //     }
    //     return this.instance
    // }
    constructor() {
        this.ws = null;
        this.callBackMapping = {}
        // 是否建立连接
        this.connected = false;
        // 连接失败的次数
        this.sendRetryCount = 0
        // 断开重连
        this.connectRetryCount = 0
    }
    // 实例属性
    // ws = null
    // 业务类型和回调函数的对应关系
    // callBackMapping = {}
    // 初始化连接kwebsockert
    connect() {
        if (!window.WebSocket) {
            console.log("你的浏览器不支持websocket");
            return;
        }
        this.ws = new WebSocket('ws://localhost:9998');
        // 监听连接成功
        this.ws.onopen = () => {
            console.log("webSocket 连接成功");
            this.connected = true;
            this.connectRetryCount = 0
        }
        // 监听连接失败
        this.ws.onclose = () => {
            console.log("webSocket 连接失败");
            this.connected = false;
            // 1.服务器连接不成功 2.服务器关闭了连接
            setTimeout(() => {
                this.connectRetryCount++;
                this.connect()
            }, 200 * this.connectRetryCount)
        }
        // 监听消息
        this.ws.onmessage = msg => {
            console.log('客户端收到服务端的 数据');
            const recvData = JSON.parse(msg.data); // 取出服务端发来的数据
            const socketType = recvData.socketType; //取出业务类型 ，来判断有无他的回调函数
            if (this.callBackMapping[socketType]) {
                const action = recvData.action
                if (action === 'getData') {
                    const realData = JSON.parse(recvData.data)
                    this.callBackMapping[socketType].call(this, realData)
                } else if (action === 'fullScreen') {
                    this.callBackMapping[socketType].call(this, recvData)
                } else if (action === 'themeChange') {
                    this.callBackMapping[socketType].call(this, recvData)
                }
            }
        }
    }

    // 数据的发送
    send(data) {
        if (this.connected) {
            this.sendRetryCount = 0
            this.ws.send(JSON.stringify(data))
        } else {
            setTimeout(() => {
                this.sendRetryCount++;
                this.send(data)
            }, 200 * this.sendRetryCount) // 发送数据尝试的次数越大, 则下一次连接的延迟也就越长

        }

    }

    // 回调函数
    registerCallBack(socketType, callBack) {
        this.callBackMapping[socketType] = callBack
    }

    UnregisterCallBack(socketType) {
        this.callBackMapping[socketType] = null
    }

}