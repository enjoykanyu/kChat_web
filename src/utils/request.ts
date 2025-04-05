import axios from 'axios'

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000
})

// 请求拦截器
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 响应拦截器
instance.interceptors.response.use(
    response => response.data,
    error => {
        if (error.response?.status === 401) {
            // 处理未授权
        }
        return Promise.reject(error)
    }
)

export default instance
