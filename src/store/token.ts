// stores/userStore.ts
import { defineStore } from 'pinia';
import {ref} from 'vue'

export const useUserStore = defineStore('user', ()=>{



    //定义状态的内容

    //1.响应式变量
    const token = ref('')
    const user = ref('')

    //2.定义一个函数,修改token的值
    const setToken = (newToken)=>{
        token.value = newToken
        sessionStorage.setItem('token', newToken)

    }
    const setUser = (newUser)=>{
        user.value = newUser
        sessionStorage.setItem('user', newUser)
    }

    //3.函数,移除token的值
    const removeToken = ()=>{
        sessionStorage.removeItem('token')
        token.value=''
    }
    const removeUser = ()=>{
        sessionStorage.removeItem('user')
        user.value=''
    }

    return {
        token,user,setUser,setToken,removeToken,removeUser
    }
},{
    persist:true//持久化存储

});