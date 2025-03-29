// WebSocket地址
const url = 'ws://localhost:8081/imserver'

// WebSocket实例
let ws

// 重连定时器实例
let reconnectTimer

// WebSocket重连开关
let isReconnecting = false

// WebSocket对象
const websocket = {
    // WebSocket建立连接
    Init (username) {
        // 判断浏览器是否支持WebSocket
        if (!('WebSocket' in window)) {
            console.log('浏览器不支持WebSocket')
            return
        }

        // 创建WebSocket实例
        ws = new WebSocket(url + username)

        // 监听WebSocket连接
        ws.onopen = () => {
            console.log('WebSocket连接成功')
        }

        // 监听WebSocket连接错误信息
        ws.onerror = (e) => {
            console.log('WebSocket重连开关', isReconnecting)
            console.log('WebSocket数据传输发生错误', e)
            // 打开重连
            reconnect()
        }

        // 监听WebSocket接收消息
        ws.onmessage = (e) => {
            console.log('WebSocket接收后端消息:', e)
            // 心跳消息不做处理
            if (e.data === 'ok') {
                return
            }

            // 调用回调函数处理接收到的消息
            if (websocket.onMessageCallback) {
                websocket.onMessageCallback(e.data)
            }
        }
    },

    // WebSocket连接关闭方法
    Close () {
        // 关闭断开重连机制
        isReconnecting = true
        ws.close()
        // ElMessage.error('WebSocket断开连接')
    },

    // WebSocket发送信息方法
    Send (data) {
        // 处理发送数据JSON字符串
        const msg = JSON.stringify(data)
        // 发送消息给后端
        ws.send(msg)
    },

    // 暴露WebSocket实例，其他地方调用就调用这个
    getWebSocket () {
        return ws
    },

    // 新增回调函数用于处理收到的消息
    onMessageCallback: null,

    // 设置消息处理回调函数
    setMessageCallback (callback) {
        this.onMessageCallback = callback
    }
}

// 监听窗口关闭事件，当窗口关闭时-每一个页面关闭都会触发-扩张需求业务
window.onbeforeunload = function () {
    // 在窗口关闭时关闭 WebSocket 连接
    websocket.Close()
    console.log('WebSocket窗口关闭事件触发')
}

// 浏览器刷新重新连接
// 刷新页面后需要重连-并且是在登录之后
if (performance.getEntriesByType('navigation')[0].type === 'reload') {
    console.log('WebSocket浏览器刷新了')

    // 延迟一定时间再执行 WebSocket 初始化，确保页面完全加载后再进行连接
    setTimeout(() => {
        console.log('WebSocket执行刷新后重连...')
        // 刷新后重连
        // 获取登录用户id
        let userId = ''
        websocket.Init(userId)
    }, 200) // 适当调整延迟时间
}

// 重连方法
function reconnect () {
    // 判断是否主动关闭连接
    if (isReconnecting) {
        return
    }
    // 重连定时器-每次WebSocket错误方法onerror触发它都会触发
    reconnectTimer && clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(function () {
        console.log('WebSocket执行断线重连...')
        // 获取登录用户id
        let userId = ''
        websocket.Init(userId)
        isReconnecting = false
    }, 4000)
}

// 暴露对象
export default websocket
