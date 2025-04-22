// plugins/axios.ts
import axios from 'axios';
import { useUserStore } from '../store/token.ts';
import router from '../router'; // 直接导入路由实例
import { useRouter } from 'vue-router';

const baseURL = '/api';
const instance = axios.create({  })

instance.interceptors.request.use(config => {
    const userStore = useUserStore(); // 获取Pinia store实例
    const token = sessionStorage.getItem("token"); // 从store获取token
    const user = sessionStorage.getItem("user");
    console.log(token)
    console.log(user)
    if (token) {
        console.log("router.push");
        config.headers['Authorization'] = token; // 设置请求头中的Authorization字段
        // router.replace({
        //     path: '/',
        //     query: {
        //         _t: Date.now()
        //     },
        // });

    }else {
        console.log("未找到token和user")
        router.replace({
            path: '/login',
            query: {
                _t: Date.now()
            },
        });
        // 清除残留的无效token
        // userStore.clearToken();



        // 中断请求链
        //路由到登录网页
    }
    console.log(333);
    console.log()
    return config;
}, error => {
    return Promise.reject(error);
});

// 新增响应拦截器处理401
instance.interceptors.response.use(
    response => response,
    error => {
        const { response } = error;

        if (response && response.status === 401) {
            /*const userStore = useUserStore();

            // 清理认证信息
            userStore.clearToken();*/
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");

            // 带原路径的重定向
            router.replace({
                path: '/login',
                query: {
                    redirect: router.currentRoute.value.fullPath,
                    _t: Date.now()
                }
            });
        }

        return Promise.reject(error);
    }
);
export default instance;