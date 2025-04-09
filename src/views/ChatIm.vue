<template>
  <div class="chat-container">
    <!-- 左侧导航栏 -->
    <div class="nav-side">
      <!-- 导航按钮 -->
      <div class="nav-items">
        <!-- 用户资料 -->
        <div
            class="nav-item"
            :class="{ active: activeTab === 'profile' }"
            @click="updateTab('profile')">
          <el-avatar :size="32" :src="loginUser.avatar" />
        </div>

        <!-- 消息 -->
        <div
            class="nav-item"
            :class="{ active: activeTab === 'message' }"
            @click="updateTab('message')">
          <el-icon :size="26" class="nav-icon">
            <Message />
          </el-icon>
          <el-badge
              v-if="totalUnread > 0"
              :value="totalUnread"
              class="nav-badge" />
        </div>

        <!-- 通讯录 -->
        <div
            class="nav-item"
            :class="{ active: activeTab === 'contact' }"
            @click="updateTab('contact')">
          <el-icon :size="26" class="nav-icon">
            <User />
            <!-- 未读消息徽章 -->
            <el-badge
                :value="unreadApply"
                v-if="3 > 0"
                class="message-badge"
            />
          </el-icon>
        </div>

        <!-- 朋友圈 -->
        <div
            class="nav-item"
            :class="{ active: activeTab === 'moment' }"
            @click="updateTab('moment')">
          <el-icon :size="26" class="nav-icon">
            <Picture />
          </el-icon>
        </div>

        <!-- 设置 -->
        <div
            class="nav-item"
            :class="{ active: activeTab === 'settings' }"
            @click="updateTab('settings')">
          <el-icon :size="26" class="nav-icon">
            <Setting />
          </el-icon>
        </div>
      </div>
    </div>
    <!-- Left side: User list -->
    <div class="left-side">
      <!-- 联系人 -->
      <template v-if="activeTab === 'contact'">
        <div class="contact-header">
          <!-- 搜索框区域 -->
          <div class="search-box">
            <el-input
                v-model="contactSearch"
                placeholder="微信号/手机号"
                clearable
                @keyup.enter.native="handleSearchUser"
                class="search-input"
            >
              <i
                  slot="suffix"
                  class="el-icon-plus search-icon"
                  @click="handleSearchUser"
              ></i>
            </el-input>

            <!-- 搜索结果悬浮层 -->
            <div
                v-if="showResultLayer"
                class="result-layer"
            >
              <div
                  v-if="searchResult"
                  class="user-item"
                  @click="showUserCard(searchResult)"
              >
                <img :src="searchResult.avatar" class="contact-avatar" />
                <div class="user-name">{{ searchResult.userName }}：</div>
                <div class="user-phone">{{ searchResult.phone }}</div>
              </div>
              <div v-else class="empty-tip">
                用户不存在
              </div>
            </div>
          </div>

          <!-- 用户卡片弹窗 -->
          <div v-if="showUserDialog" class="dialog-mask">
            <div class="user-card">
              <div v-if="!showAddFriendForm" class="main-content">
                <!-- 关闭按钮 -->
                <div class="close-btn" @click="closeDialog">×</div>

                <!-- 用户信息区域 -->
                <div class="card-header">
                  <img :src="currentSearchUser.avatar" class="contact-avatar" />
                  <div class="user-info">
                    <h3>{{ currentSearchUser.userName }}</h3>
                    <p class="signature">{{ currentSearchUser.signature || '暂无个性签名' }}</p>
                  </div>
                </div>

                <!-- 详细信息 -->
                <div class="detail-section">
                  <div class="detail-item">
                    <span>手机号</span>
                    <span>{{ currentSearchUser.phone}}</span>
                  </div>
                  <div v-if="isFriend" class="detail-item">
                    <span>朋友圈</span>
                    <span>{{ currentSearchUser.moments || 0 }}条动态</span>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="action-buttons">
                  <template v-if="isFriend">
                    <button class="btn primary">发消息</button>
                    <button class="btn">视频通话</button>
                    <button class="btn">语音通话</button>
                  </template>
                  <button v-else class="btn add-friend" @click="enterAddFriend">加好友</button>
                </div>

              </div>
              <!-- 好友申请表单 -->
              <div v-else class="friend-form">
                <div class="form-header">
                  <el-icon class="back-icon" @click="showAddFriendForm = false">
                    <ArrowLeft />
                  </el-icon>
                  <h3>好友申请</h3>
                </div>

                <div class="form-body">
                  <el-input
                      v-model="applyReason"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入申请理由（最多50字）"
                      maxlength="50"
                      show-word-limit
                      class="reason-input"
                  />

                  <div class="form-actions">
                    <button
                        class="btn submit-btn"
                        :disabled="!applyReason"
                        @click="handleSubmitApply"
                    >
                      发送申请
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>



        </div>

        <el-scrollbar class="contact-list-scroll">
          <!-- 新朋友固定按钮 -->
          <div class="new-friend-item" @click="showNewFriendList">
            <el-icon class="new-friend-icon">
              <User />
              <el-badge
                  :value="unreadApply"
                  v-if="3 > 0"
                  class="message-badge"
              />
            </el-icon>
            <span>新的朋友<!-- 未读消息徽章 -->
            </span>
          </div>

          <!-- 联系人列表 -->
          <div
              v-for="contact in filteredContacts"
              :key="contact.id"
              class="contact-item"
              @click="selectContact(contact)"
          >
            <img :src="contact.friendUser.avatar" class="contact-avatar" />
            <span class="contact-name">{{ contact.friendUser.userName }}</span>
          </div>
        </el-scrollbar>
      </template>
      <template v-if="activeTab === 'message'">

      <!-- Search input (moved outside) -->
      <div class="search-wrapper">
<!--        <el-input v-model="searchUserName" placeholder="回车搜索用户" class="search-input" @keydown.enter.native="searchUserForForm"></el-input>-->
        <el-input
            v-model="searchUserName"
            placeholder="回车搜索用户"
            class="search-input"
            @keydown.enter.native="searchUserForForm"
            @input="handleSearchInput"
            clearable
        ></el-input>
      </div>
      <!-- 搜索结果悬浮层 -->
      <transition name="fade">
        <el-scrollbar
            v-show="showSearchResult"
            class="user-list-scroll-search"
            :class="{ 'search-active': showSearchResult }"
        >
          <el-row>
            <el-col
                :span="24"
                v-for="form in searchMessageForm"
                :key="form.recieiveUser.id"
                @click.native="handleSelectUser(form.recieiveUser)"
                class="user-item"
            >
              <!-- 用户项结构（同原有内容） -->
              <div class="user-avatar-wrapper">
                <!-- 方形头像 -->
                <img
                    :src="form.recieiveUser.avatar"
                    class="user-avatar"
                >

                <!-- 未读消息徽章 -->
                <el-badge
                    :value="form.noReadMessageLength"
                    v-if="form.noReadMessageLength > 0"
                    class="message-badge"
                />

                <!-- 在线状态指示 -->
                <div
                    v-if="form.recieiveUser.isOnline"
                    class="online-dot"
                ></div>
              </div>

              <div class="user-details">
                <div class="header-line">
                  <div class="user-name">{{ form.recieiveUser.userName }}</div>
                  <div class="message-time">{{ formatTime(form.lastMessageTime) }}</div>
                </div>
                <div class="last-message">
                  {{ form.lastMessage || "暂无消息" }}
                </div>
              </div>
            </el-col>
          </el-row>
        </el-scrollbar>
      </transition>

      <!-- User list (with scroll) -->
      <el-scrollbar class="user-list-scroll">
        <el-row>
          <el-col
              :span="24"
              v-for="form in curAllMessage"
              :key="form.user.id"
              @click.native="chooseUser(form.receiver_user)"
              class="user-item"
              v-if="messageForm.length !== 0"
          >
            <div class="user-avatar-wrapper">
              <!-- 方形头像 -->
              <img
                  :src="form.user.avatar"
                  class="user-avatar"
              >

              <!-- 未读消息徽章 -->
              <el-badge
                  :value="form.user.unread"
                  v-if="form.user.unread > 0"
                  class="message-badge"
              />

<!--              &lt;!&ndash; 在线状态指示 &ndash;&gt;-->
<!--              <div-->
<!--                  v-if="form.recieiveUser.isOnline"-->
<!--                  class="online-dot"-->
<!--              ></div>-->
            </div>

            <div class="user-details">
              <div class="header-line">
                <div class="user-name">{{ form.receiver_user.userName }}</div>
                <div class="message-time">{{ formatTime(form.time) }}</div>
              </div>
              <div class="last-message">
                {{form.user.userName}}:
                {{ form.cotnet || "暂无消息" }}
              </div>
            </div>
          </el-col>
        </el-row>
      </el-scrollbar>
      </template>
    </div>
    <!-- Right side: Chat box -->
    <div class="right-side">
      <!-- Chat header -->
      <div class="chat-header">
        <span v-if="currentUser">{{ currentUser.userName }}</span>
      </div>
      <!-- Chat messages -->
      <el-scrollbar class="chat-messages" ref="messageContainer">
        <div class="messageBox" v-for="message in messages" :key="message" :class="{ ownMessage: message.sendUserId === loginUser.id, otherMessage: message.sendUserId !== loginUser.id }">
          <div><img :src="message.sendUserId === loginUser.id ? loginUser.avatar : currentUser.avatar" alt="" style="border: 1px solid #70c1fa;"></div>
          <div class="messageContent">{{ message.message}}</div>
          <div class="messageTime">{{ message.createTime }}</div>
<!--          <div v-if=""></div>-->
        </div>
      </el-scrollbar>
      <div class="chat-input">
        <el-input
            v-model="newMessage.content"
            placeholder="请输入聊天内容"
            type="textarea"
            :rows="2"
            resize="none"
            class="message-input"
            @keydown.enter.native.prevent="send"
        ></el-input>
        <el-button
            type="primary"
            @click.native="send"
            class="send-button"
        >发送</el-button>
      </div>
    </div>
  </div>
</template>

<script>
// import request from "@/utils/request";
import axios from "axios";

let socket;
import { reactive,ref} from 'vue'
let messageContainer =ref(null)
let formInline = reactive({
  user: '',
  region: '',
  date: '',
})
import {
  Message,
  User,
  Picture,
  Setting
} from '@element-plus/icons-vue'


// 状态管理
// const activeTab = ref('message') // 当前激活的tab
const totalUnread = ref(3)       // 未读消息数示例

// 用户数据
// const loginUser = ref({
//   avatar: 'https://example.com/avatar.jpg'
// })
export default {
  name: "Im",
  data() {
    return {
      friendApplications:[], //申请好友列表
      showDialog: false, // 好友申请控制弹窗显示
      unreadMessage: 0, //所有的未读消息数量
      unreadApply:0, //所有的未处理的好友申请数量
      unreadMoment:0,//所有的未看过的朋友圈数量
      showResultLayer : false,
      searchResult:null,
      showUserDialog : false,
      showAddFriendForm : false,
      applyReason : '',
      isFriend : false,
      filteredContacts:[],
      contactSearch:'',
      activeTab:"message",
      circleUrl: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      user: {},
      isCollapse: false,
      users: [],
      chatUser: '',
      text: "",
      content: '',
      currentUser: null, // 当前聊天的人
      currentSearchUser: null, // 当前搜索的用户
      loginUser: null,
      messages: [],
      messageForm: [], // 聊天所有信息
      curAllMessage: [], // 当前用户聊天所有信息根据消息发送时间倒序排序
      searchMessageForm: [], // 搜索聊天所有信息
      newMessage: {
        id: '',
        sendUser: '',
        receiveUser: '',
        message: '',
        is_read: '0',
        createTime: '',
        updateTime: '',
      },
      searchUserName: '',
      showSearchResult: false,
    }
  },
  created() {
    this.init()
    this.initMockData()
  },

  mounted() {
    this.scrollToBottom()
    this.searchUserMessage()//默认进入网页当前为消息页
  },
  beforeCreate () {
    axios.defaults.headers.common['authorization'] = window.sessionStorage.getItem("token");
    // 获取登录用户userId,请根据自己实际项目获取
    axios.get("api/user/login/user")
        .then(
            res => {
              console.log(res)
              this.loginUser = res.data.data
              console.log(this.loginUser)
            }
        )
  },
  methods: {
    // 初始化虚拟数据
    initMockData() {
      this.messageForm = Array.from({ length: 15 }, (_, i) => ({
        recieiveUser: {
          id: `user_${i + 1}`,
          userName: `用户 ${i + 1}`,
          avatar: `https://picsum.photos/40/40?random=${i}`,
          isOnline: Math.random() > 0.5
        },
        noReadMessageLength: Math.floor(Math.random() * 5),
        lastMessage: this.generateMockMessage(),
        lastMessageTime: Date.now() - Math.random() * 86400000
      }))
    },
    /*
    * 搜索用户*/
    // handleSearchUser(){
    //
    // },
    handleAddContact(){

    },
    // 手机号脱敏处理
    // maskPhone(phone) {
    //   phone= phone.replace(/(\d{3})\d{4}(\d{4})/, '$1&zwnj;****&zwnj;$2');
    // }

    // 搜索用户
    handleSearchUser() {
      if (!this.contactSearch.trim()) return;

      try {
        // 模拟API调用
        const res = axios.get("api/friends/search/user",{
              params:{"phone":this.contactSearch}
            }
        ).then(res => {
          if (res.data.code === 200) {
            this.searchResult = res.data.data;
            this.showResultLayer = true;
            console.log(this.searchResult);
          }else {
          }
          console.log(res)
        })
      } catch (error) {
        this.searchResult = null;
        this.showResultLayer = true;
      }
    },

    // 显示用户卡片
    showUserCard(user) {
      this.currentSearchUser = user;
      this.showResultLayer = false;

      // 检查好友状态
      // try {
      //   const res =  this.$http.get(`/api/friend-status/${user.id}`);
      //   this.isFriend = res.data.isFriend;
        //请求查看当前搜索用户是否为当前用户的好友
      this.showUserDialog = true
      axios.post("api/friends/search/isFriend", this.currentSearchUser

      ).then(res => {
        if (res.data.code === 200) {
          this.isFriend = true
        }else {
          this.isFriend = false
        }
        console.log(res)
      })
    // } catch (error) {
    //   this.searchResult = null;
    //   this.showResultLayer = true;
    // }
      // } catch (error) {
      //   console.error('获取好友状态失败');
      // }
    },

    // 关闭弹窗
    closeDialog() {
      this.showUserDialog = false;
      this.currentSearchUser = {};
    },





    // 提交好友申请
    handleSubmitApply() {
      try {
        axios.post('/api/friend-apply', {
          applyUserId: this.currentSearchUser.id,
          reason:this.applyReason,
        });

        this.$message.success('好友申请已发送');
        this.showAddFriendForm = false;
      } catch (error) {
        this.$message.error('发送失败，请重试');
      }
    },

    // 进入好友申请表单
    enterAddFriend() {
      this.showAddFriendForm = true;
      this.applyReason = '';
    },
    generateMockMessage() {
      const messages = [
        '你好，今天有空吗？',
        '项目文档已更新',
        '[图片]',
        '[文件]',
        '明天会议时间确认？'
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    },
    updateTab(tab){
      this.activeTab = tab
      console.log(this.activeTab)
      if (this.activeTab === "contact") {
        this.searchAllFriends()
      }else if (this.activeTab === "message") {
        this.searchUserMessage()
      }
    },
    //搜索当前用户所有信息 请求后端完成则更新所有用户信息保存到前端数据 拿到所有信息 from_user:发送者 send_user:接受者 create_time 发送消息时间 is_read 是否已读 message_id 消息id message_content 消息内容
    searchAllFriends(){
      axios.get("api/friends/all").then(res => {
        console.log(res)
        this.filteredContacts = res.data;
        console.log(this.filteredContacts)
      })
    },
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },

    send() {
      if (!this.newMessage.content.trim()) {
        this.$message.warning('请输入聊天内容')
        return
      }
      this.newMessage.message = this.newMessage.content.trim()
      if (this.loginUser.id == null) {
        this.$message.error('登录用户编号获取失败,请重新登录!')
        return
      }
      if (this.loginUser.id  === this.currentUser.id) {
        this.$message.error('不能给自己发送信息!')
        return
      }
      this.newMessage.sendUserId = this.loginUser.id
      this.newMessage.receiveUserId = this.currentUser.id
      if (typeof (WebSocket) == "undefined") {
          console.log("您的浏览器不支持WebSocket");
      } else {
          console.log("您的浏览器支持WebSocket");
          // 组装待发送的消息 json
          // {"from": "zhang", "to": "admin", "text": "聊天文本"}
          // let message = {from: this.user.username, to: this.chatUser, text: this.text}
        console.log(this.newMessage);
        socket.send(JSON.stringify(this.newMessage));  // 将组装好的json发送给服务端，由服务端进行转发
          // this.messages.push({user: this.user.username, text: this.text})
          // 构建消息内容，本人消息
          // this.createContent(null, this.user.username, this.text)
          // this.text = '';
        axios.post("/api/chat/send", this.newMessage).then(res => {
          console.log(res)
          console.log(this.currentUser)
          this.chooseUser(this.currentUser)
          this.searchUserMessage() //更新当前最新消息
        })
        }

    },
    createContent(remoteUser, nowUser, text) {  // 这个方法是用来将 json的聊天消息数据转换成 html的。
      let html
      // 当前用户消息
      if (nowUser) { // nowUser 表示是否显示当前用户发送的聊天消息，绿色气泡
        html = "<div class=\"el-row\" style=\"padding: 5px 0\">\n" +
            "  <div class=\"el-col el-col-22\" style=\"text-align: right; padding-right: 10px\">\n" +
            "    <div class=\"tip left\">" + text + "</div>\n" +
            "  </div>\n" +
            "  <div class=\"el-col el-col-2\">\n" +
            "  <span class=\"el-avatar el-avatar--circle\" style=\"height: 40px; width: 40px; line-height: 40px;\">\n" +
            "    <img src=\"https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png\" style=\"object-fit: cover;\">\n" +
            "  </span>\n" +
            "  </div>\n" +
            "</div>";
      } else if (remoteUser) {   // remoteUser表示远程用户聊天消息，蓝色的气泡
        html = "<div class=\"el-row\" style=\"padding: 5px 0\">\n" +
            "  <div class=\"el-col el-col-2\" style=\"text-align: right\">\n" +
            "  <span class=\"el-avatar el-avatar--circle\" style=\"height: 40px; width: 40px; line-height: 40px;\">\n" +
            "    <img src=\"https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png\" style=\"object-fit: cover;\">\n" +
            "  </span>\n" +
            "  </div>\n" +
            "  <div class=\"el-col el-col-22\" style=\"text-align: left; padding-left: 10px\">\n" +
            "    <div class=\"tip right\">" + text + "</div>\n" +
            "  </div>\n" +
            "</div>";
      }
      console.log(html)
      this.content += html;
    },
    //搜索当前用户所有信息 请求后端完成则更新所有用户信息保存到前端数据 拿到所有信息 from_user:发送者 send_user:接受者 create_time 发送消息时间 is_read 是否已读 message_id 消息id message_content 消息内容
    searchUserForForm(){
      axios.get("api/chat/allChat",{
        params:{"sendUserId":this.loginUser.id,
          "searchUserName":this.searchUserName
        }
      }).then(res => {
        console.log(res)
        this.showSearchResult = true
        this.searchMessageForm = res.data.data;
        console.log(this.searchMessageForm)
      })
    },
    //搜索当前用户发过的消息和接受到的消息，根据最后一条消息时间倒序排序
    searchUserMessage(){
      axios.get("api/chat/allChatUser").then(res => {
        console.log(res)
        this.curAllMessage = res.data.data;
        // this.showSearchResult = true
        // this.searchMessageForm = res.data.data;
        // console.log(this.searchMessageForm)
      })
    },
    handleSearchInput(val) {
      if (!val) {
        this.showSearchResult = false
      }
    },
    handleSelectUser(user) {
      this.chooseUser(user)
      this.showSearchResult = false
      this.searchUserName = ''
    },

    chooseUser (user) {
      this.currentUser = user
      this.fetchMessages(user.id)
    },
    //更新消息列表
    fetchMessages(userId) {
      axios.get("api/chat/oneChat",{
        params:{"sendUserId":this.loginUser.id,
          "receiveUserId":userId
        }
      }).then(res => {
        this.messages = res.data.data[0].chatContents
        console.log(this.messages)
          // 将聊天记录总下拉到最下方
          this.$nextTick(() => {
            this.scrollToBottom()
          })
      })
    },
    // 消息过多的时候滚动到最新消息位置
    scrollToBottom () {
      // 使用 $refs 来获取对消息容器的引用
      const container = this.$refs.messageContainer
      console.log(container)
      var assign = Object.assign({}, container);
      console.log(assign);
      console.log(assign.wrapRef);
      assign.wrapRef.scrollTop=100000
      // console.log(container.scrollHeight)
      // messageContainer.value.wrapRef.scrollTop = messageContainer.value.wrapRef.scrollHeight;
      //
      // .$refs.wrap
      // 滚动到底部
      // container.scrollTop = 900
    },

    init() {
      console.log(window.sessionStorage.getItem("user"))
      this.user = window.sessionStorage.getItem("user")
      if (this.user){
        console.log(window.sessionStorage.getItem("user"))
        this.user = {"userId":window.sessionStorage.getItem("user")}
        console.log(this.user)
        let userId = this.user.userId;
        let _this = this;
        if (typeof (WebSocket) == "undefined") {
          console.log("您的浏览器不支持WebSocket");
        } else {
          console.log("您的浏览器支持WebSocket");
          console.log("当前登录用户"+userId)
          let socketUrl = "ws://localhost:8081/imserver/" + userId;
          // if (socket != null) {
          //   socket.close();
          //   socket = null;
          // }
          // 开启一个websocket服务
          socket = new WebSocket(socketUrl);
          //打开事件
          socket.onopen = function () {
            console.log("websocket已打开");
          };
          //  浏览器端收消息，获得从服务端发送过来的文本消息
          socket.onmessage = (msg) => {
            console.log("收到数据====" + msg.data)
            console.log(typeof msg.data)
            var data_new = JSON.parse(msg.data);
            console.log(data_new);
            axios.get("api/chat/oneChat",{
              params:{"sendUserId":data_new.receiveUserId,
                "receiveUserId":data_new.sendUserId
              }
            }).then(res => {
              this.messages = res.data.data[0].chatContents
              console.log(this.messages)
              //浏览器接受服务端返回的消息 接收方更新消息列表
              this.searchUserMessage()
              // 将聊天记录总下拉到最下方
              this.$nextTick(() => {
                this.scrollToBottom()
              })
            })
          };
          //关闭事件
          socket.onclose = function () {
            console.log("websocket已关闭");
          };
          //发生了错误事件
          socket.onerror = function () {
            console.log("websocket发生了错误");
          }
        }
      }else {

      }

    }
  }
}
</script>
<style scoped>


.left-side {
  position: relative; /* Position relative for absolute positioning */
  flex: 1;
  padding: 20px;
  border-right: 1px solid #eaeaea;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.search-input {
  position: absolute;
  top: 20px;
  left: 20px;
  width: calc(100% - 40px);
  max-width: 300px;
}

.user-list-scroll {
  top: 40px;
  overflow-y: auto;
  height: calc(100% - 56px);
  position: relative;
  z-index: 1;

}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.search-active + .user-list-scroll {
  filter: blur(1px);
  pointer-events: none;
}
.user-list-scroll-search{
  height: calc(100% - 40px);
  overflow-y: auto;
}
.user-avatar-wrapper {
  position: relative;
  display: inline-block;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid #74ffd2;
}

.user-name {
  font-weight: 800;
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 溢出隐藏 */
  padding-left: 15px;
  text-overflow: ellipsis; /* 超出显示省略号 */
  text-align: left; /* 添加左对齐属性 */
}

.user-last-message {
  color: #a19f9f;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  padding-left: 15px;
  text-overflow: ellipsis;
  text-align: left; /* 添加左对齐属性 */
}



.chat-header {
  padding: 20px;
  border-bottom: 1px solid #eaeaea;
  font-size: 1.2em;
  color: #37474F;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.chat-input {
  padding: 20px;
  display: flex;
  align-items: center;
}

.message-input {
  flex: 1;
  margin-right: 10px;
}

.send-button {
  flex-shrink: 0;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f0f0f2;
}

.user-item:hover {
  background-color: #E0E0E0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.user-details {
  flex-grow: 1; /* 填充剩余空间 */
}

.messageBox {
  display: flex;
  align-items: flex-start; /* 将头像和文本第一行对齐 */
  margin-bottom: 10px;
}

.messageBox img {
  width: 40px; /* 调整头像大小 */
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  margin-left: 10px;
}

.messageContent {
  max-width: 70%; /* 调整发送信息宽度 */
  padding: 10px;
  border-radius: 8px;
  background-color: #f0f0f0;
  text-align: left; /* 文本左对齐 */
  word-wrap: break-word; /* 当文本过长时自动换行 */
}

.messageTime {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
  margin-top: 5px; /* 将发送时间与文本分隔开 */
}

.ownMessage {
  flex-direction: row-reverse;
  align-items: flex-end; /* 将发送时间放置在最下方的贴右位置 */
}

.otherMessage {
  flex-direction: row;
  align-items: flex-end; /* 将发送时间放置在最下方的贴左位置 */
}

.online-dot {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 10px;
  height: 10px;
  background-color: #01c201;
  border-radius: 50%;
}
.message-badge .el-badge__content {
  position: absolute;
  bottom: 5px; /* Adjust to your desired position */
  left: 5px; /* Adjust to your desired position */
  background-color: #f56c6c; /* Red background for visibility */
  color: white; /* White text color */
}

/* 容器布局 */
.chat-container {
  display: flex;
  height: 100vh;
  min-width: 800px;
}

/* 左侧用户列表 */
.left-side {
  width: 280px;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
}

.search-wrapper {
  padding: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.user-list-scroll {
  flex: 1;
  overflow: hidden;
}

/* 右侧聊天区域 */
.right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 400px;
}

/* 聊天头部 */
.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e5e5;
  background: #fafafa;
  font-size: 16px;
  font-weight: 500;
}

/* 消息区域 */
.chat-messages {
  flex: 1;
  padding: 20px 24px;
  background: #f5f5f7;
  overflow-y: auto;
}

/* 消息气泡 */
.messageBox {
  display: flex;
  margin-bottom: 20px;
  max-width: 70%;
}

.ownMessage {
  margin-left: auto;
  flex-direction: row-reverse;
}

.otherMessage {
  margin-right: auto;
}

/* 头像样式 */
.avatar-wrapper {
  flex-shrink: 0;
  margin: 0 12px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #70c1fa;
}

/* 消息内容 */
.message-content-wrapper {
  max-width: calc(100% - 64px);
  position: relative;
}

.ownMessage .message-content-wrapper {
  align-items: flex-end;
}

.messageContent {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.5;
  word-break: break-word;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.ownMessage .messageContent {
  background: #95ec69;
  border-radius: 12px 12px 0 12px;
}

.otherMessage .messageContent {
  background: #ffffff;
  border-radius: 12px 12px 12px 0;
}

/* 消息时间 */
.messageTime {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.ownMessage .messageTime {
  text-align: right;
}

/* 输入区域 */
.chat-input {
  padding: 16px 24px;
  border-top: 1px solid #e5e5e5;
  background: #fff;
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
}

.message-input >>> .el-textarea__inner {
  padding: 8px 12px;
  border-radius: 8px;
  line-height: 1.5;
}

.send-button {
  align-self: flex-end;
  padding: 8px 20px;
  border-radius: 6px;
}
/* 新增导航栏样式 */
.chat-container {
  display: flex;
  height: 100vh;
}

.nav-side {
  width: 72px;
  background: #2e3238;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  border-right: 1px solid #1e2025;
}

.nav-item {
  width: 48px;
  height: 48px;
  margin: 12px 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;

  &:hover {
    background: rgba(255,255,255,0.1);
  }

  &.active {
    background: rgba(255,255,255,0.2);

    .nav-icon {
      color: #70c1fa;
    }
  }
}

.nav-icon {
  font-size: 24px;
  color: #b9b9b9;
}

.nav-badge {
  position: absolute;
  top: -4px;
  right: -4px;
}

/* 调整左侧内容区 */
.left-side {
  width: 280px;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
}

.sub-header {
  padding: 16px;
  font-weight: 500;
  border-bottom: 1px solid #e5e5e5;
}
.user-list-scroll {
  height: 600px;
  --badge-size: 20px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-bottom: 1px solid #ebeef5;
}

.user-item:hover {
  background: #f5f7fa;
}

.user-avatar-wrapper {
  position: relative;
  margin-right: 16px;
  flex-shrink: 0;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
}

.message-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  transform: scale(0.8);

  :deep(.el-badge__content) {
    height: var(--badge-size);
    min-width: var(--badge-size);
    padding: 0 5px;
    line-height: var(--badge-size);
  }
}

.online-dot {
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #67C23A;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.header-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.user-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  color: #909399;
  font-size: 12px;
  flex-shrink: 0;
  margin-left: 8px;
}

.last-message {
  color: #606266;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 240px;
}
.user-list-scroll-search {
  position: absolute;
  top: 56px; /* 根据搜索框高度调整 */
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 2;
  transition: all 0.3s ease;
}

.contact-header {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.contact-search-input {
  width: 100%;
}

.contact-search-input .el-icon {
  cursor: pointer;
  color: #409eff;
}

.contact-list-scroll {
  height: calc(100% - 60px);
}

.new-friend-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.new-friend-item:hover {
  background-color: #f5f5f5;
}

.new-friend-icon {
  margin-right: 10px;
  font-size: 20px;
  color: #409eff;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
}

.contact-item:hover {
  background-color: #f5f5f5;
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 12px;
}

.contact-name {
  font-size: 14px;
}
/* 弹窗蒙层 - 确保位于最顶层 */
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(3px); /* 添加毛玻璃效果 */
}

/* 卡片容器 */
.user-card {
  overflow: hidden;
  position: relative;
  width: 480px;
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: cardEnter 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

/* 入场动画 */
@keyframes cardEnter {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 关闭按钮增强 */
.close-btn {
  z-index: 1;
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #f5f5f5;
  transform: rotate(90deg);
}

.close-btn::before {
  //content: "×";
  font-size: 24px;
  color: #999;
  transition: color 0.3s;
}

.close-btn:hover::before {
  color: #666;
}

/* 用户信息区域 */
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #f0f2f5;
  margin-right: 16px;
  overflow: hidden;
}

.user-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1a1a1a;
  font-weight: 600;
}

.signature {
  color: #909399;
  font-size: 14px;
  line-height: 1.4;
  max-width: 240px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 详细信息区域 */
.detail-section {
  margin: 24px 0;
  padding: 16px 0;
  border-top: 1px solid #ebedf0;
  border-bottom: 1px solid #ebedf0;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 14px;
}

.detail-item span:first-child {
  color: #909399;
  min-width: 72px;
}

.detail-item span:last-child {
  color: #303133;
  font-weight: 500;
}

/* 操作按钮优化 */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn.primary {
  background: #409eff;
  color: white;
}

.btn.primary:hover {
  background: #66b1ff;
}

.btn:not(.primary) {
  background: #f5f5f5;
  color: #606266;
}

.btn:not(.primary):hover {
  background: #e5e5e5;
}

.btn.add-friend {
  background: #67c23a;
  color: white;
  width: 100%;
}

.btn.add-friend:hover {
  background: #85ce61;
}

/* 响应式处理 */
@media (max-width: 480px) {
  .user-card {
    width: 90%;
    min-width: 300px;
    padding: 20px;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* 新增样式 */
.friend-form {
  padding: 20px;
}

.form-header {
  position: relative;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 20px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  margin-right: 15px;
}

.back-icon:hover {
  color: #409EFF;
  transform: translateX(-3px);
}

.form-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.reason-input textarea {
  resize: none;
  padding: 12px;
  font-size: 14px;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.reason-input textarea:focus {
  border-color: #409EFF;
}

.form-actions {
  margin-top: 25px;
  text-align: right;
}

.submit-btn {
  background: #67C23A;
  color: white;
  padding: 10px 30px;
  border-radius: 20px;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #EBEEF5;
  color: #C0C4CC;
  cursor: not-allowed;
}
/* 保持原有样式的基础上增加过渡效果 */
.main-content,
.friend-form {
  transition: all 0.3s ease;
}
</style>
