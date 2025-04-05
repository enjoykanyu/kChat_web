<template>
  <div class="common-layout">

    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="手机号">
        <el-input v-model="formInline.phone" placeholder="请输入手机号" clearable />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="formInline.password" placeholder="请输入密码" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">登录</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>

<script lang="ts" setup>
// import Header from '../components/Header.vue';
// export default {
//   name: "IndexVue",
//   components: {
//     Header,
//   }
// }
import { reactive } from 'vue'
import axios   from "axios";
const formInline = reactive({
  phone: '',
  password: '',
})
axios.defaults.headers.common['authorization'] = window.sessionStorage.getItem("token");


const onSubmit = () => {
  axios.post("api/user/login", formInline)
      .then(
          res => {
            console.log(res)
            console.log(333)
            window.sessionStorage.setItem("token", res.data.data.token)
            console.log(window.sessionStorage.getItem("token"))
          }
      )

  console.log("成功")
  console.log(window.sessionStorage.getItem("token"))
  axios.defaults.headers.common['authorization'] = window.sessionStorage.getItem("token");
  axios.get("api/user/login/user")
      .then(
          res => {
            console.log(res)
            window.sessionStorage.setItem("user",res.data.data.id)
            const user = window.sessionStorage.getItem("user")
            console.log(user)
          }
      )
  console.log('submit!')
}
</script>
<style>
.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}
</style>