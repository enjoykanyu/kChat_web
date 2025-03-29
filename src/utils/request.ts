// plugins/axios.ts
import axios from 'axios';
import { useUserStore } from '../store/token.ts';

const baseURL = '/api';
const instance = axios.create({  })

instance.interceptors.request.use(config => {
    const userStore = useUserStore(); // 获取Pinia store实例
    const token = sessionStorage.getItem("token"); // 从store获取token
    if (token) {
        config.headers['Authorization'] = token; // 设置请求头中的Authorization字段
    }else {
        console.log("未找到token")
    }
    console.log(333);
    console.log()
    return config;
}, error => {
    return Promise.reject(error);
});
export default instance;