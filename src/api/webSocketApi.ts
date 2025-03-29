import axios from 'axios';

// 发送信息
export function sendMessageTo (data) {
    return axios.post('/webSocket/sendMessageTo',data)
}

// 获取在线人数
export function getOnLineUser () {
    return axios.get('/webSocket/getOnLineUser')
    // request({
    //     url: '/webSocket/getOnLineUser',
    //     method: 'get',
    //     params: {}
    // })
}

// 发送信息给所有人
export function sendMessageAll (message) {
    return axios.get('/webSocket/sendMessageAll')

    // {
    //     url: '/webSocket/sendMessageAll',
    //     method: 'get',
    //     params: {
    //         message
    //     }
    // })
}
