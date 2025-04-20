<template>
  <div class="auth-modal">
    <!-- 选项卡切换 -->
    <div class="tabs">
      <button
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
      >
        登录
      </button>
      <button
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
      >
        注册
      </button>
    </div>

    <!-- 登录表单 -->
    <form v-if="activeTab === 'login'" @submit.prevent="handleLogin">
      <div class="login-type">
        <label>
          <input
              type="radio"
              v-model="loginType"
              value="password"
          > 密码登录
        </label>
        <label>
          <input
              type="radio"
              v-model="loginType"
              value="code"
          > 验证码登录
        </label>
      </div>

      <div class="form-group">
        <input
            type="text"
            v-model="loginForm.phone"
            placeholder="用户名/手机号"
            required
        >
      </div>

      <div class="form-group" v-if="loginType === 'password'">
        <input
            type="password"
            v-model="loginForm.password"
            placeholder="密码"
            required
        >
      </div>

      <div class="form-group code-group" v-else>
        <input
            type="text"
            v-model="loginForm.code"
            placeholder="验证码"
            required
        >
        <button
            type="button"
            class="send-code"
            :disabled="countdown > 0"
            @click="sendCode"
        >
          {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
        </button>
      </div>

      <button type="submit" class="submit-btn">登录</button>
    </form>

    <!-- 注册表单 -->
    <form v-else @submit.prevent="handleRegister">
      <div class="form-group">
        <input
            type="text"
            v-model="registerForm.username"
            placeholder="用户名"
            required
        >
      </div>

      <div class="form-group">
        <input
            type="password"
            v-model="registerForm.password"
            placeholder="密码"
            required
        >
      </div>

      <div class="form-group">
        <input
            type="password"
            v-model="registerForm.confirmPassword"
            placeholder="确认密码"
            required
        >
      </div>

      <div class="form-group">
        <input
            type="text"
            v-model="registerForm.phone"
            placeholder="手机号"
            required
        >
      </div>
      <button type="submit" class="submit-btn">注册</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from "axios";
import request from '../utils/request.ts'

interface LoginForm {
  phone: string
  password: string
  code: string
}

interface RegisterForm {
  username: string
  password: string
  confirmPassword: string
  phone:string
}

const router = useRouter()

// 选项卡状态
const activeTab = ref<'login' | 'register'>('login')

// 登录类型
const loginType = ref<'password' | 'code'>('password')

// 登录表单数据
const loginForm = reactive<LoginForm>({
  phone: '',
  password: '',
  code: ''
})

// 注册表单数据
const registerForm = reactive<RegisterForm>({
  username: '',
  password: '',
  confirmPassword: '',
  phone:'',
})

// 验证码倒计时
const countdown = ref(0)
let timer: number | null = null
const handleLogin=()=> {
  console.log(loginType.value)
    const apiPath = loginType.value === 'password'
        ? 'api/user/login'
        : 'api/user/login/code'

    const payload = loginType.value === 'password'
        ? {
          phone: loginForm.phone,
          password: loginForm.password
        }
        : {
          phone: loginForm.phone,
          code: loginForm.code
        }
    console.log(apiPath)
    request.post(apiPath, payload).then((res) => {
    console.log(res)
    console.log(333)
      if (res.data.success) {
        if ( loginType.value === 'code'){
          window.sessionStorage.setItem("token", res.data.data)
        }else {
          window.sessionStorage.setItem("token", res.data.data.token)

        }
        console.log(window.sessionStorage.getItem("token"))
          console.log(res.data.success)
          // 登录成功逻辑
          router.push('/chatim')
      }else if (res.data.errorMsg === '用户不存在') {
          alert("用户不存在，请注册")
        activeTab.value = 'register'
      }

  })

    console.log("成功")
    console.log(window.sessionStorage.getItem("token"))

    // axios.defaults.headers.common['authorization'] = window.sessionStorage.getItem("token");    this.$store.commit('SET_TOKEN', data.token) // 状态管理‌:ml-citation{ref="7" data="citationList"}
    // this.$router.push('/dashboard') // 跳转逻辑‌:ml-citation{ref="3" data="citationList"}

}

const sendCode = () => {
  if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
    alert('请输入有效的手机号')
    return
  }

  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
  console.log(loginForm.code)
  request.post(`/api/user/code?phone=${loginForm.phone}`).then((res) => {
    console.log(res)
    console.log(333)
    window.sessionStorage.setItem("token", res.data.data.token)
    console.log(window.sessionStorage.getItem("token"))
  })
}

// const handleLogin = async () => {
//   // 模拟登录逻辑
//   const userExists = Math.random() > 0.5 // 模拟用户是否存在
//
//   if (!userExists) {
//     alert('用户不存在，自动跳转注册')
//     activeTab.value = 'register'
//     return
//   }
//
//   // 登录成功逻辑
//   router.push('/chatim')
// }

const handleRegister = () => {
  if (registerForm.password !== registerForm.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  console.log(registerForm)
  request.post("/api/register/user", {
    "phone": registerForm.phone,
    "password": registerForm.password,
    "userName": registerForm.username,
  }).then((res) => {
    let alertMsg = ""

    if (res.data.errorMsg === '用户已注册过，请登录') {
      activeTab.value = 'login'
      alertMsg = res.data.errorMsg
    }else if (res.data.code===200){
      alertMsg = "注册成功"
      activeTab.value = 'login'
    }
    alert(alertMsg)
  })
  // 清空注册表单
  Object.assign(registerForm, {
    username: '',
    password: '',
    confirmPassword: '',
    phone:'',
  })
}
</script>

<style scoped>
/* 基础容器 */
.auth-modal {
  width: 380px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  padding: 40px;
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
}

/* 选项卡样式 - 参考B站风格 */
.tabs {
  display: flex;
  margin-bottom: 32px;
  position: relative;
}

.tabs button {
  flex: 1;
  padding: 0 0 16px;
  border: none;
  background: none;
  font-size: 20px;
  color: #757575;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.tabs button.active {
  color: #00a1d6; /* B站主蓝色 */
  font-weight: 500;
}

.tabs button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background: #00a1d6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
}

.tabs button.active::after {
  width: 100%;
}

/* 表单组样式 - 参考微信风格 */
.form-group {
  margin-bottom: 24px;
  position: relative;
}

.form-group input {
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 1px solid #ebebeb;
  border-radius: 8px;
  font-size: 16px;
  color: #333;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #f7f7f7;
}

.form-group input:focus {
  border-color: #00a1d6;
  box-shadow: 0 2px 8px rgba(0, 161, 214, 0.12);
  background: #fff;
}

.form-group input::placeholder {
  color: #999;
}

/* 验证码发送按钮 - 微信风格 */
.code-group {
  display: flex;
  gap: 12px;
}

.send-code {
  flex-shrink: 0;
  width: 120px;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: #00a1d6;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.send-code:disabled {
  background: #b8e2f0;
  cursor: not-allowed;
}

/* 登录方式切换 */
.login-type {
  display: flex;
  gap: 24px;
  margin-bottom: 28px;
}

.login-type label {
  display: flex;
  align-items: center;
  color: #666;
  cursor: pointer;
  transition: color 0.2s;
}

.login-type input[type="radio"] {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  accent-color: #00a1d6;
}

/* 提交按钮 - 微信/B站混合风格 */
.submit-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: #00a1d6;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 12px;
}

.submit-btn:hover {
  background: #0092c4;
  transform: translateY(-1px);
}

/* 错误提示动画（可后续扩展） */
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(6px); }
  50% { transform: translateX(-6px); }
  100% { transform: translateX(0); }
}
</style>
