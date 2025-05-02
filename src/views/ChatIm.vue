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
            @click="showUserCard(loginUser)">
          <el-avatar :size="32" :src="loginUser.avatar" class="user-avatar"/>
        </div>

        <!-- 消息 -->
        <div
            class="nav-item"
            :class="{ active: activeTab === 'message' }"
            @click="updateTab('message')">
          <el-icon :size="26" class="nav-icon">
            <ChatDotRound />
          </el-icon>
          <el-badge
              v-if="totalUnread > 0"
              :value="totalUnread"
              class="nav-badge"
          />
        </div>

        <!-- 智能机器人 -->
        <div
            class="nav-item"
            :class="{ active: activeTab === 'chatbot' }"
            @click="updateTab('chatbot')">
          <el-icon :size="26" class="nav-icon">
            <ChatDotRound />
          </el-icon>
          <el-badge
              v-if="totalUnread > 0"
              :value="totalUnread"
              class="nav-badge"
          />
        </div>

        <!-- 通讯录 -->
        <div
            class="nav-item"
            :class="{ active: activeTab === 'contact' }"
            @click="updateTab('contact')">
          <el-icon :size="26" class="nav-icon">
            <User />
          </el-icon>
          <!-- 未读消息徽章 -->
          <el-badge
              :value="unreadApply"
              v-if="3 > 0"
              class="message-badge"
          />
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
                class="contact-search-input"
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
                    <button class="btn primary" @click="handleSelectUser(currentSearchUser)">发消息</button>
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

        <!-- 新好友弹窗组件 -->
        <!-- 申请列表弹窗 -->
        <div v-if="showDialog" class="dialog-mask">
          <!--          <div class="user-card"> @click="closeDialog"></div>-->
          <!--333-->
          <div class="dialog-content">
            <div class="close-btn" @click="closeApply">×</div>
            <h3 class="dialog-title">好友申请</h3>

            <div class="application-list">
              <div
                  v-for="(item, index) in friendApplications"
                  :key="index"
                  class="application-item"
              >
                <!--      点击可以查看用户信息          -->
                <div class="user-avatar" @click="">
                  <img :src="item.applyUser.avatar" alt="avatar" />
                </div>

                <div class="user-info">
                  <div class="name-row">
                    <span class="username">{{ item.applyUser.userName }}</span>
                    <span class="wechat-id">微信号：{{ item.applyUser.phone}}</span>
                  </div>
                  <p class="apply-reason">{{ item.reason }}</p>
                </div>

                <div class="action-buttons">

                  <button
                      v-if="item.status === 0"
                      class="btn accept"
                      @click="handleApply(item.applyUser.id,true)"
                  >
                    同意
                  </button>
                  <button
                      v-if="item.status === 0"
                      class="btn reject"
                      @click="handleApply(item.applyUser.id,false)"
                  >
                    拒绝
                  </button>
                  <!--                  :class="['status-tag']"-->
                  <span
                      v-else
                      :class="['status-tag', item.status]"
                  >
                {{ item.status === 1 ? '已通过' : '已拒绝' }}
              </span>
                </div>
              </div>
              <div v-if="friendApplications.length <= 0"> 暂无好友申请 </div>
            </div>
          </div>
        </div>

      </template>
      <template v-if="activeTab === 'message'">

        <!--        搜索框和消息加上统一容器-->
        <div class="left-chat-container">

          <!-- Search input (moved outside) -->
          <div class="search-wrapper">
            <!--        <el-input v-model="searchUserName" placeholder="回车搜索用户" class="search-input" @keydown.enter.native="searchUserForForm"></el-input>-->
            <input
                type="text"
                v-model="searchUserName"
                placeholder="回车搜索用户"
                class="search-input"
                @keydown.enter="searchUserForForm"
                @input="handleSearchInput"
            >

            <!-- 新增独立图标按钮 -->
            <button class="add-btn" @click="newChatGroup">+</button>
          </div>
          <!-- User list (with scroll) -->
          <el-scrollbar class="user-list-scroll">
            <el-row>
              <el-col
                  :span="24"
                  v-for="(form, index) in curAllMessage"
                  :key="index"
                  @click.native="chooseUser(form)"
                  @click="activeIndex = index"
                  :class="{ 'active-item': activeIndex === index }"
                  class="user-item"
                  v-if="messageForm.length !== 0"
              >
                <div class="user-avatar-wrapper">
                  <!-- 方形头像 -->
                  <img
                      :src="form.avatar"
                      class="user-avatar"
                  >

                  <!-- 未读消息徽章 -->
                  <el-badge
                      :value="form.unreadCount"
                      v-if="form.unreadCount > 0"
                      class="message-badge"
                  />

                  <!--              &lt;!&ndash; 在线状态指示 &ndash;&gt;-->
                  <!--              <div-->
                  <!--                  v-if="form.recieiveUser.isOnline"-->
                  <!--                  class="online-dot"-->
                  <!--              ></div>-->
                </div>

                <div class="user-details">
                  <!-- 头部行容器 -->
                  <div class="header-line">
                    <div class="user-name ellipsis">{{ form.chatName }}</div>
                    <div class="message-time">{{ formatTime(form.lastSendTime) }}</div>
                  </div>

                  <!-- 最后消息 -->
                  <div class="last-message ellipsis">
                    <span :class="['last-message', { truncate: form.chatName.length>6 }]">
                      {{ form.chatName }}
                    </span>：
                    {{ form.lastContent || "暂无消息" }}
                  </div>
                </div>


              </el-col>
            </el-row>
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
          </el-scrollbar>
          <!--新实现-->
          <div v-if="showNewgroup" class="dialog-mask">
            <div class="dialog-wrapper wechat-style">
              <!-- 对话框主体 -->
              <div class="dialog-container">
                <!-- 标题栏 -->
                <div class="dialog-header">
                  <h3 class="title">发起群聊</h3>
                  <div class="close-btn" @click="showNewgroup = false">×</div>
                </div>

                <!-- 内容区（左右分栏） -->
                <div class="dialog-body">
                  <!-- 左侧好友列表 -->
                  <div class="left-panel">
                    <div class="search-box">
                      <input
                          type="text"
                          placeholder="搜索"
                          v-model="searchKey"
                          class="wechat-search"
                      >
                    </div>
                    <div class="friend-list">
                      <div
                          v-for="friend in filteredContacts"
                          :key="friend.friendUser.id"
                          class="friend-item"
                          @click="toggleSelection(friend)"
                      >
                        <div class="selection-mark" v-show="isSelected(friend)">
                          <div class="check-icon"></div>
                        </div>
                        <img :src="friend.friendUser.avatar" class="user-avatar">
                        <div class="name">
                          <span>{{ friend.friendUser.userName }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 右侧已选区域 -->
                  <div class="right-panel">
                    <div class="selected-header">
                      <span class="text">已选（{{ selectedFriends.length }}）</span>
                      <button class="clear-btn" @click="clearAll">清空</button>
                    </div>

                    <div class="selected-list">
                      <div
                          v-for="(friend, index) in selectedFriends"
                          :key="index"
                          class="selected-item"
                      >
                        <div class="avatar-wrapper">
                          <img :src="friend.friendUser.avatar" class="user-avatar">
                          <div class="remove-btn" @click.stop="removeFriend(index)">×</div>
                        </div>
                        <span class="name">{{ friend.friendUser.userName }}</span>
                      </div>
                    </div>

                    <div class="group-input">
                      <input
                          type="text"
                          v-model="groupName"
                          placeholder="填写群聊名称（必填）"
                          class="wechat-input"
                      >
                    </div>
                  </div>
                </div>

                <!-- 底部操作按钮 -->
                <div class="dialog-footer">
                  <button class="wechat-btn cancel" @click="showNewgroup = false">取消</button>
                  <button class="wechat-btn primary" @click="createGroup">完成</button>
                </div>
              </div>
            </div>
          </div>

        </div>

      </template>
    </div>
    <!-- Right side: Chat box -->
    <div class="right-side">
      <!-- Chat header -->
      <div class="chat-header" style="display: flex; align-items: center; justify-content: space-between;">
        <!--        :class="{ 'long-name': currentUser.userName.length > 6 }" -->

        <div v-if="currentGroup">
           <span  class="username-wrap"
           >{{ currentGroup }}</span>💬
        </div>
       <div v-else>
         <span class="username-wrap">{{ currentUser.userName }}
        </span>
       </div>

        <!--        <span v-if="currentGroupId" class="username-wrap"
                      :class="{ 'long-name': currentUser.userName.length > 6 }">{{ currentUser.userName }}</span>
           -->
        <el-icon class="header-icon" @click="groupconfig">
        <MoreFilled />
      </el-icon>
      </div>
      <!-- Chat messages -->
      <el-scrollbar class="chat-messages" ref="messageContainer">
        <div v-if="messageType==0">
          <div class="messageBox" v-for="message in messages" :key="message" :class="{ ownMessage: message.sendUserId === loginUser.id, otherMessage: message.sendUserId !== loginUser.id }">
            <div><img :src="message.sendUserId === loginUser.id ? loginUser.avatar : currentUser.avatar" alt="" style="border: 1px solid #70c1fa;"></div>
            <div class="messageContent">{{ message.message}}</div>
            <div class="messageTime">{{ message.createTime }}</div>
            <!--          <div v-if=""></div>-->
          </div>
        </div>
        <div v-if="messageType==1">

          <div  class="messageBox" v-for="message in groupMessages" :key="message" :class="{ ownMessage: message.userId === loginUser.id, otherMessage: message.userId !== loginUser.id }">
            <!--           &lt;!&ndash;type=2系统消息&ndash;&gt; 不展示用户头像且信息居中-->
            <!--              <div class="messageContent">{{ message.content}}</div>
                          <div class="messageTime">{{ message.sendTime }}</div>-->
            <!--type=1 成员消息-->
            <div v-if="message.type==1"><img :src="message.userId === loginUser.id ? loginUser.avatar : message.userAvatar" alt="" style="border: 1px solid #70c1fa;"></div>
            <div class="messageContent">{{ message.content}}</div>
            <div class="messageTime">{{ message.sendTime }}</div>

            <!--          <div v-if=""></div>-->
          </div>
        </div>


      </el-scrollbar>
<!--      <div class="chat-input">-->
<!--        <el-input-->
<!--            v-model="newMessage.content"-->
<!--            placeholder="请输入聊天内容"-->
<!--            type="textarea"-->
<!--            :rows="2"-->
<!--            resize="none"-->
<!--            class="message-input"-->
<!--            @keydown.enter.native.prevent="send"-->
<!--        ></el-input>-->
<!--        <el-button-->
<!--            type="primary"-->
<!--            @click.native="send"-->
<!--            class="send-button"-->
<!--        >发送</el-button>-->
<!--      </div>-->
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="left-tools">
          <button class="tool-btn" @click="toggleVoiceMode">
            <span class="icon" :class="isVoiceMode ? 'voice' : 'keyboard'"></span>
          </button>
          <button class="tool-btn" @click="toggleEmojiPicker">
            <span class="icon emoji"></span>
          </button>
          <button class="tool-btn" @click="triggerFileInput">
            <span class="icon file"></span>
            <input type="file" ref="fileInput" class="hidden-file" @change="handleFile">
          </button>
        </div>

        <div class="right-tools">
          <button class="tool-btn" @click="startVideoCall">
            <span class="icon video"></span>
          </button>
          <button class="tool-btn" @click="startVoiceCall">
            <span class="icon phone"></span>
          </button>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <!-- 语音输入模式 -->
        <div v-if="isVoiceMode" class="voice-mode">
          <button
              class="voice-btn"
              @mousedown="startRecord"
              @mouseup="stopRecord"
              @touchstart="startRecord"
              @touchend="stopRecord"
          >
            {{ recording ? `录音中 ${duration}s` : '按住 说话' }}
          </button>
        </div>

        <!-- 文本输入模式 -->
        <div v-else class="text-mode">
        <textarea
            ref="textarea"
            v-model="newMessage.content"
            class="message-input"
            placeholder="请输入聊天内容"
            @input="autoResize"
            @keydown.enter.prevent="send"
        ></textarea>
          <button class="send-btn" @click="send">发送</button>
        </div>
      </div>

      <!-- 表情选择面板 -->
      <div v-show="showEmojiPicker" class="emoji-panel">
        <div
            class="emoji-item"
            v-for="emoji in emojis"
            :key="emoji"
            @click="insertEmoji(emoji)"
        >{{ emoji }}</div>
      </div>
      <!-- 抽屉内容 -->
      <div class="drawer-mask" v-show="drawerVisible" @click="drawerVisible = false"></div>
      <div class="drawer-container" :class="{ show: drawerVisible }">
        <div class="drawer-content">
          <!-- 群聊内容 -->
          <template v-if="currentGroup">
            <div class="group-title">群聊设置</div>
            <div class="member-list">
              <div v-for="member in groupMembers" :key="member.id" class="member-item">
                <img :src="member.avatar" class="member-avatar"/>
                <span>{{ member.userName }}</span>
              </div>
            </div>
            <div class="action-list">
              <div class="action-item" @click="clearChat">清空聊天记录</div>
              <div class="action-item text-danger" @click="quitGroup">退出群聊</div>
            </div>
          </template>

          <!-- 私聊内容 -->
          <template v-else>
            <div class="user-info">
              <img :src="currentUser.avatar" class="user-avatar"/>
              <div class="user-name">{{ currentUser.userName }}</div>
            </div>
            <div class="action-list">
              <div class="action-item" @click="clearChat">清空聊天记录</div>
              <div class="action-item" @click="deleteFriend">删除好友</div>
              <div class="action-item text-danger" @click="addBlacklist">加入黑名单</div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
// import request from "@/utils/request";
import axios from "axios";
import request from '../utils/request.ts'
import { ElMessageBox,ElMessage } from 'element-plus'

let socket = null;
import { reactive,ref,onMounted,getCurrentInstance,nextTick,toRaw,computed} from 'vue'
// 在setup函数中获取组件实例
const instance = getCurrentInstance();
// const container = instance?.proxy?.$refs.messageContainer; // 需添加可选链操作符‌:ml-citation{ref="3,8" data="citationList"}

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
let activeIndex = ref(-1)//聊天对象默认赋值
let groupMembers = ref([])//当前群成员
let  drawerVisible = ref(false) //群设置和单聊设置弹窗
let showNewgroup = ref(false)
let friendApplications=ref([]) //申请好友列表
let  showDialog=ref(false) // 好友申请控制弹窗显示
let   unreadMessage=ref(0 )//所有的未读消息数量
let   unreadApply=ref(0)//所有的未处理的好友申请数量
let  unreadMoment=ref(0)//所有的未看过的朋友圈数量
let   showResultLayer =ref(false)
let  searchResult=reactive({})
let   showUserDialog=ref(false)
let   showAddFriendForm=ref(false)
let   applyReason=ref('')
let    isFriend=ref(false)
let   filteredContacts=ref([])
let   selectedFriends=ref([])//新建群聊选择的好友
let   contactSearch=ref('')
let   activeTab=ref("message")
let   circleUrl=ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')
let  user=ref({})
let isCollapse=ref(false)
let  users=ref([])
let   chatUser=ref('')
let    text=ref("")
let    content=ref('')
let   currentUser=reactive({})// 当前聊天的人
let    currentGroupId=ref("") // 当前聊天的群id
let currentGroup = ref('') // 当前聊天的群
let    currentSearchUser=reactive({}) // 当前搜索的用户
let    loginUser=reactive({})
let    messages=ref([]) //单聊消息
let    groupMessages=ref([]) //群聊消息
let   messageType=ref(0)// 当前消息类型 0单来哦 1群聊
let  messageForm=ref([]) // 聊天所有信息
let  curAllMessage=ref([]) // 当前用户聊天所有信息根据消息发送时间倒序排序加上群聊消息
let  searchMessageForm=ref([]) // 搜索聊天所有信息
let   newMessage=ref({
  id: '',
  sendUser: '',
  receiveUser: '',
  message: '',
  notRead: '0',
  chatType:'private', //聊天对象 private 单聊 group 群聊
  groupId: '', //扩展群聊id
  createTime: '',
  updateTime: '',
})
let searchUserName=ref('')
let  showSearchResult=ref(false)
let groupName = ref('') //群名称
// 状态管理
const isVoiceMode = ref(false)
const showEmojiPicker = ref(false)
const message = ref('')
const recording = ref(false)
const duration = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)
const textarea = ref<HTMLTextAreaElement | null>(null)

// 录音相关
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

// 模拟表情数据
const emojis = [
  '😊', '🥰', '🤩', '😇',   // 笑脸类
  '🤔', '😏', '😒', '🙄',   // 表情符号
  '🤯', '🥶', '😡', '🤢',   // 夸张表情
  '🫡', '🫠', '🥺', '😈',   // 新增Unicode 14-15表情:ml-citation{ref="5" data="citationList"}
  '👋', '🤘', '🤙', '🤌',   // 手势符号
  '🐶', '🐱', '🦁', '🐼',   // 动物类
  '🌻', '🌼', '🍄', '🌵',   // 植物类
  '🍕', '🍔', '🍩', '🍹',   // 食物饮料
  '⚽', '🎮', '🎲', '🎸'    // 活动物品类
];

// 自动调整输入框高度
const autoResize = () => {
  if (textarea.value) {
    textarea.value.style.height = 'auto'
    textarea.value.style.height = `${textarea.value.scrollHeight}px`
  }
}

// 切换语音模式
const toggleVoiceMode = () => {
  isVoiceMode.value = !isVoiceMode.value
  showEmojiPicker.value = false
}

// 文件处理
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFile = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    console.log('选择文件:', file)
    input.value = ''
  }
}

// 表情处理
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmoji = (emoji: string) => {
  console.log(emoji)
  console.log(newMessage.value.content)
  if (newMessage.value.content) {
    newMessage.value.content += emoji
  }else {
    newMessage.value.content = emoji
  }
  console.log("加入表情包之前")
  console.log(emoji)
  console.log(newMessage.value.content)
  nextTick(autoResize)
  showEmojiPicker.value = false
}

// 语音录制
const startRecord = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      console.log('录音文件:', audioBlob)
      const formData = new FormData()
      formData.append('audioFile', audioBlob, 'recording.webm')  // 使用FormData封装二进制数据:ml-citation{ref="2" data="citationList"}
      request.post('/api/audio/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(res => {
        console.log('上传成功:', res.data)
      })
      //录音文件清空
      audioChunks = []
    }

    mediaRecorder.start()
    recording.value = true
    startTimer()
  } catch (err) {
    console.error('录音权限被拒绝:', err)
  }
}

const stopRecord = () => {
  mediaRecorder?.stop()
  recording.value = false
  duration.value = 0
}

// 录音计时器
const startTimer = () => {
  const timer = setInterval(() => {
    if (recording.value) {
      duration.value++
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

// // 消息发送
// const sendMessage = () => {
//   if (message.value.trim()) {
//     console.log('发送消息:', message.value)
//     message.value = ''
//     if (textarea.value) textarea.value.style.height = 'auto'
//   }
// }

// 通话功能
const startVideoCall = () => console.log('发起视频通话')
// const activeTab = ref('message') // 当前激活的tab
const totalUnread = ref(3)       // 未读消息数示例

// 初始化虚拟数据
const initMockData = () => {
  messageForm.value = Array.from({ length: 15 }, (_, i) => ({
    recieiveUser: {
      id: `user_${i + 1}`,
      userName: `用户 ${i + 1}`,
      avatar: `https://picsum.photos/40/40?random=${i}`,
      isOnline: Math.random() > 0.5
    },
    noReadMessageLength: Math.floor(Math.random() * 5),
    lastMessage: generateMockMessage(),
    lastMessageTime: Date.now() - Math.random() * 86400000
  }))
}
// 显示用户卡片
const showUserCard = (user) =>{
  currentSearchUser = user;
  showResultLayer.value = false;

  // 检查好友状态
  // try {
  //   const res =  this.$http.get(`/api/friend-status/${user.id}`);
  //   this.isFriend = res.data.isFriend;
  //请求查看当前搜索用户是否为当前用户的好友
  showUserDialog.value = true
  if (user.id!=loginUser.id){
    request.post("api/friends/search/isFriend", currentSearchUser

    ).then(res => {
      if (res.data.code === 200) {
        isFriend.value = true
      }else {
        isFriend.value = false
      }
      console.log(res)
    })
  }else {
    isFriend.value = true
  }

  // } catch (error) {
  //   this.searchResult = null;
  //   this.showResultLayer = true;
  // }
  // } catch (error) {
  //   console.error('获取好友状态失败');
  // }
}
// 搜索用户
const handleSearchUser=()=> {
  if (!contactSearch.value.trim()) return;

  try {
    // 模拟API调用
    const res = request.get("api/friends/search/user",{
          params:{"phone":contactSearch.value}
        }
    ).then(res => {
      if (res.data.code === 200) {
        searchResult = res.data.data;
        showResultLayer.value = true;
        console.log(searchResult);
      }else {
      }
      console.log(res)
    })
  } catch (error) {
    searchResult = null;
    showResultLayer.value = true;
  }
}
//展示所有的用户申请列表
const showNewFriendList=()=>{
  getAllRequests()
  //新好友列表弹窗
  showDialog.value = true

}
//关闭查看所有好友申请弹窗
const closeApply=()=>{
  showDialog.value = false
}
// 关闭申请弹窗
const closeDialog=() =>{
  showUserDialog.value = false;
  currentSearchUser = {};
}

// 提交好友申请
const handleSubmitApply=()=> {
  try {
    request.post('/api/friends/friend-apply', {
      applyUserId: currentSearchUser.id,
      reason:applyReason.value,
    }).then(res => {
      console.log(res)
    });
    showUserDialog.value = false
    ElMessage.success('好友申请已发送');
    // this.$message.success('好友申请已发送');
    showAddFriendForm.value = false;
  } catch (error) {
    // this.$message.error('发送失败，请重试');
    ElMessage.error('发送失败，请重试');

  }
}

// 进入好友申请表单
const enterAddFriend=() =>{
  showAddFriendForm.value = true;
  applyReason.value = '';
}
const generateMockMessage=() =>{
  const messages = [
    '你好，今天有空吗？',
    '项目文档已更新',
    '[图片]',
    '[文件]',
    '明天会议时间确认？'
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}
const updateTab=(tab)=>{
  activeTab.value = tab
  console.log(activeTab.value)
  if (activeTab.value === "contact") {
    searchAllFriends()
  }else if (activeTab.value === "message") {
    searchUserMessage()
  }
}
//搜索当前用户所有信息 请求后端完成则更新所有用户信息保存到前端数据 拿到所有信息 from_user:发送者 send_user:接受者 create_time 发送消息时间 is_read 是否已读 message_id 消息id message_content 消息内容
const searchAllFriends=()=>{
  request.get("api/friends/all").then(res => {
    console.log(res)
    filteredContacts.value = res.data;
    console.log(filteredContacts.value)
  })
}
const formatTime=(timestamp)=> {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
const send=()=> {
  console.log(currentUser.valueOf())
  const flag = Object.keys(toRaw(currentUser)).length === 0
  console.log(flag )
  if (!flag){
    if (!newMessage.value.content.trim()) {
      // this.$message.warning('请输入聊天内容')
      ElMessage.warning('请输入聊天内容')

      return
    }
    newMessage.value.message = newMessage.value.content.trim()
    if (loginUser.id == null) {
      ElMessage.warning('登录状态无效，请重新登录')
      return
    }
    if (loginUser.id  === currentUser.id) {
      ElMessage.error('不能给自己发送信息!')
      return
    }
    newMessage.value.sendUser = loginUser.id
    newMessage.value.receiveUser = currentUser.id
    newMessage.value.chatType = "private"
    if (typeof (WebSocket) == "undefined") {
      console.log("您的浏览器不支持WebSocket");
    } else {
      console.log("您的浏览器支持WebSocket");
      // 组装待发送的消息 json
      // {"from": "zhang", "to": "admin", "text": "聊天文本"}
      // let message = {from: this.user.username, to: this.chatUser, text: this.text}
      console.log(newMessage.value);
      console.log(typeof (newMessage.value.sendUser));
      console.log(typeof (newMessage.value.receiveUser));
      console.log(newMessage.value);
      // this.messages.push({user: this.user.username, text: this.text})
      // 构建消息内容，本人消息
      // this.createContent(null, this.user.username, this.text)
      // this.text = '';
      request.post("/api/chat/send", newMessage.value).then(res => {
        console.log(res)
        console.log(currentUser)
        if (res.data.code === 200) { //仅为当前好友且未删除和拉进黑名单可发送消息
          const message = {
            chatType: 0,
            user: currentUser
          }
          socket.send(JSON.stringify(newMessage.value));  // 将组装好的json发送给服务端，由服务端进行转发
          chooseUser(message)
          searchUserMessage() //更新当前最新消息
        }else if(res.data.code === 100007) { //你删除了改好友或者该好友删除了你，发送系统消息“当前用户还不是你的好友，发送失败” 这个消息只有发送者可以看到
          alert("对方不是你的好友，无法进行聊天");
        }else if(res.data.code === 100008) {
          //你拉黑了对方
        }else if(res.data.code === 200004) {
          //对方拉黑了你
        }

      })
    }
  }else {
    console.log("发送群聊id",currentGroupId.value);
    if (!newMessage.value.content.trim()) {
      ElMessage.warning('请输入聊天内容')
      return
    }
    newMessage.value.message = newMessage.value.content.trim()
    if (loginUser.id == null) {
      ElMessage.error('登录用户编号获取失败,请重新登录!')
      return
    }
    newMessage.value.sendUser = loginUser.id
    newMessage.value.groupId = currentGroupId.value
    newMessage.value.chatType = "group"
    if (typeof (WebSocket) == "undefined") {
      console.log("您的浏览器不支持WebSocket");
    } else {
      console.log("您的浏览器支持WebSocket");
      // 组装待发送的消息 json
      // {"from": "zhang", "to": "admin", "text": "聊天文本"}
      // let message = {from: this.user.username, to: this.chatUser, text: this.text}
      console.log(newMessage.value);
      socket.send(JSON.stringify(newMessage.value));  // 将组装好的json发送给服务端，由服务端进行转发
      // this.messages.push({user: this.user.username, text: this.text})
      // 构建消息内容，本人消息
      // this.createContent(null, this.user.username, this.text)
      // this.text = '';
      request.post("/api/chat/send", newMessage.value).then(res => {
        console.log(res)
        console.log(currentUser)
        const message = {
          chatType: 1,
          group:{
            groupId: currentGroupId.value,
          }
        }
        chooseUser(message)
        searchUserMessage() //更新当前最新消息
      })
    }
  }
  //清空聊天框
  newMessage.value.content = ''

}
//当前群聊设置
const groupconfig =()=>{
  drawerVisible.value = true
  request.get("api/group/getGroupMember",{
    params:{"groupId":currentGroupId.value,
    }
  }).then(res => {
    console.log(res)
    groupMembers.value = res.data.data
    console.log(groupMembers.value)
  })
}
//搜索当前用户所有信息 请求后端完成则更新所有用户信息保存到前端数据 拿到所有信息 from_user:发送者 send_user:接受者 create_time 发送消息时间 is_read 是否已读 message_id 消息id message_content 消息内容
const searchUserForForm=()=>{
  request.get("api/chat/allChat",{
    params:{"sendUserId":loginUser.id,
      "searchUserName":searchUserName.value
    }
  }).then(res => {
    console.log(res)
    showSearchResult.value = true
    searchMessageForm.value = res.data.data;
    console.log(searchMessageForm.value)
  })
}
//搜索当前用户发过的消息和接受到的消息，根据最后一条消息时间倒序排序
const searchUserMessage=()=>{
  request.get("api/chat/allChatUser").then(res => {
    console.log(res)
    curAllMessage.value = res.data.data;
    console.log(curAllMessage.value)
    // this.showSearchResult = true
    // this.searchMessageForm = res.data.data;
    // console.log(this.searchMessageForm)
  })
}

const handleSearchInput=(val)=> {
  if (!val) {
    showSearchResult.value = false
  }
}
const handleSelectUser=(user)=>{
  const message = {
    chatType: 0,
    user: user
  }
  chooseUser(message)
  showSearchResult.value = false
  showUserDialog.value = false
  searchUserName.value = ''
  activeTab.value = 'message'
}

const chooseUser= (message) =>{
  console.log(message)
  const type = message.chatType
  if (type === 0){

    messageType.value = 0 //设置当前类型为单聊消息 用于区分右侧消息内容
    console.log(111)
    // currentUser = message.user //当前为单聊设置发送对象user
    // 通过 Object.assign 更新属性而非覆盖对象
    Object.assign(currentUser, message.user);
    console.log(currentUser)
    currentGroupId.value = "" //当前设置群聊为空
    currentGroup.value = ''
    console.log("进入了单聊if当前选择群聊",currentGroupId.value)
    console.log("进入了单聊if当前选择聊天对象",currentUser.valueOf())
    fetchMessages(message.user.id)
  }else if(type === 1){
    messageType.value = 1 //设置当前类型为单聊消息 用于区分右侧消息内容
    currentUser = {} //当前为单聊设置发送对象null
    console.log(message.group)
    currentGroupId.value = message.group.groupId //当前设置群聊为空
    console.log("进入了群聊if当前选择群聊",currentGroupId.value)
    console.log("进入了群聊if当前选择聊天对象",currentUser)
    fetchMessagesGroup(message.group.groupId)
    currentGroup.value = message.group.groupName //更新当前聊天群对象
    console.log(currentGroup)
  }

}
//更新消息列表单聊
const fetchMessages=(userId) =>{
  request.get("api/chat/oneChat",{
    params:{"sendUserId":loginUser.id,
      "receiveUserId":userId
    }
  }).then(res => {
    messages.value = res.data.data[0].chatContents
    console.log(messages.value )
    // 将聊天记录总下拉到最下方
    nextTick(() => {
      scrollToBottom()
    })
  })
}
//更新消息列表群聊
const fetchMessagesGroup=(groupId) =>{
  console.log(groupId)
  request.get("api/chat/groupChat",{
    params:{"groupId":groupId,
    }
  }).then(res => {
    // this.messages = res.data.data[0].chatContents
    console.log(res)
    groupMessages.value= res.data.data
    // 将聊天记录总下拉到最下方
    nextTick(() => {
      scrollToBottom()
    })
  })
}
//获取所有的好友请求
const getAllRequests=(userId)=> {
  request.get("api/friends/requests/all",{
    params:{"sendUserId":loginUser.id,
      "receiveUserId":userId
    }
  }).then(res => {
    console.log(res.data)
    friendApplications.value = res.data
  })
}
//获取所有未处理的好友请求
const getAllPending=(userId) =>{
  request.get("api/friends/requests/all/getPending",{
    params:{"sendUserId":loginUser.id,
      "receiveUserId":userId
    }
  }).then(res => {
    // this.messages = res.data.data[0].chatContents
    // console.log(this.messages)
    // // 将聊天记录总下拉到最下方
    // this.$nextTick(() => {
    //   this.scrollToBottom()
    // })
    console.log(res.data)
    unreadApply.value = res.data.length
    console.log(unreadApply.value)
  })
}

/*同意和拒绝好友*/
const handleApply =(requestid,accept)=>{
  request.put(`api/friends/requests/${requestid}?accept=${accept}`,{
    "accept":accept,
  }).then(res => {
    console.log(res.data)
    friendApplications.value = res.data
    showDialog.value = false
  })
}
/*发起群聊*/
const newChatGroup=()=>{
  searchAllFriends()
  showNewgroup.value=true
  //更新最后消息列表
  // searchUserMessage()
  console.log("333")
  console.log(filteredContacts.value)
  console.log(filteredContacts.value)

}

// 判断是否已选中
const isSelected=(friend) =>{
  return selectedFriends.value.some(f =>
      f.friendUser.id === friend.friendUser.id
  );
}

// 切换选择状态
const toggleSelection=(friend)=> {
  const index = selectedFriends.value.findIndex(f =>
      f.friendUser.id === friend.friendUser.id
  );
  console.log(index, friend)
  if (index > -1) {
    selectedFriends.value.splice(index, 1);
  } else {
    selectedFriends.value.push(friend);
  }
}
// 移除单个好友
const removeFriend=(index)=> {
  selectedFriends.value.splice(index, 1);
}

// 清空所有选择
const clearAll=()=> {
  selectedFriends.value = [];
}

// 创建群组
const createGroup=()=>{
  console.log(groupName.value)
  if (!groupName.value) {
    alert('请填写群聊名称');
    return;
  }
  if (selectedFriends.value.length < 1) {
    alert('请至少选择一位成员');
    return;
  }

  const payload = {
    groupName: groupName.value,
    member: selectedFriends.value.map(f => f.friendUser)
  };

  // 调用API
  console.log('提交数据:', payload);
  // this.$emit('create', payload);
  request.post("api/group/create",payload).then(res => {

    console.log(res.data)
    //更新最后消息列表
    searchUserMessage()
  })

  clearAll();
  groupName.value = '';
  //关闭弹窗
  showNewgroup.value = false;
}
// 消息过多的时候滚动到最新消息位置
const scrollToBottom = () =>{
  // 使用 $refs 来获取对消息容器的引用
  const container = instance?.proxy?.$refs.messageContainer
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
}
const init=() =>{

  console.log(window.sessionStorage.getItem("user"))
  console.log(user)
  user.value = window.sessionStorage.getItem("user")
  if (user.value){
    console.log(window.sessionStorage.getItem("user"))
    user.value = {"userId":window.sessionStorage.getItem("user")}
    console.log(user.value)
    let userId = user.value.userId;
    let _this = this;
    if (typeof (WebSocket) == "undefined") {
      console.log("您的浏览器不支持WebSocket");
    } else {
      console.log("您的浏览器支持WebSocket");
      console.log("当前登录用户"+userId)
      let socketUrl = "ws://localhost:8082/imserver/" + userId;
      // if (socket != null) {
      //   socket.close();
      //   socket = null;
      // }
      // 开启一个websocket服务
      // 修复后的逻辑
      if (socket) {
        // 无论旧连接状态如何，直接关闭并清空引用
        socket.close();
        socket = null; // 防止残留引用
      }
      socket = new WebSocket(socketUrl);
      //打开事件
      socket.onopen = ()=> {
        console.log("websocket已打开");
      };
      //  浏览器端收消息，获得从服务端发送过来的文本消息
      socket.onmessage = (msg) => {
        console.log(msg);
        console.log("收到数据====" + msg.data)
        console.log(typeof msg.data)
        var data_new = JSON.parse(msg.data);
        const type = data_new.type //收到消息类型 2 用户之间发送的消息 1 好友之前处理消息
        console.log(type)
        if (type === 2){
          console.log(data_new);
          request.get("api/chat/oneChat",{
            params:{"sendUserId":data_new.receiveUserId,
              "receiveUserId":data_new.sendUserId
            }
          }).then(res => {
            messages.value  = res.data.data[0].chatContents
            console.log(messages.value )
            //浏览器接受服务端返回的消息 接收方更新消息列表
            searchUserMessage()
            // 将聊天记录总下拉到最下方
            nextTick(() => {
              scrollToBottom()
            })
          })
        }else if(type === 1){ //处理用户之前请求好友关系
          setTimeout(() => {
            // this.$message.success('您收到了用户'+data_new.sendUserId+'好友发过来申请');
            ElMessage.success('您收到了用户'+data_new.sendUserId+'好友发过来申请');
            ElMessage.success('验证理由'+data_new.content);
            // this.$message.success('验证理由'+data_new.content);
          }, 3000)
          //1，更新用户处理中的好友数量 数量=/requests/all/getPending.length
          getAllPending()
          //2，用户新的朋友列表请求所有的请求的朋友列表，通过或者拒绝的好友右边显示状态和理由 未处理过的显示通过和拒绝按钮
          //3，用户点击同意 发送消息给服务端同意 同时把消息存储进消息db 新建一条“通过了您的好友”消息 同时消息列表更新
        }else if(type === 3){
          if (data_new.content ==='拒绝'){
            ElMessage.error('您的好友请求被拒绝');
          }else {
            ElMessage.success('您的好友请求已通过');
          }
          searchUserMessage()
          updateTab('message')
          //发送请求得展示申请的情况
          //接受者展示处理情况

        }else if(type === 4){
          console.log("处理群聊消息")
          console.log(data_new)
          //更新群聊消息
          fetchMessagesGroup(data_new.groupId);
          //更新最后消息列表
          searchUserMessage()
          // 将聊天记录总下拉到最下方
          nextTick(() => {
            scrollToBottom()
          })
        }else if (type === 5){//新建群聊广播群成员
          //更新最后消息列表
          searchUserMessage()
        }


      };
      //关闭事件
      socket.onclose =  () =>{
        console.log("websocket已关闭");
      };
      //发生了错误事件
      socket.onerror = (error)=> {
        console.log("websocket发生了错误");
        console.error("WebSocket 错误:",error);

      }
    }
  }else {

  }

}
//单向删除好友
const deleteFriend =async()=>{
  console.log(currentUser)
  await ElMessageBox.confirm('确定删除该好友？', '警告', { type: 'warning' })

  request.post(`api/friends/delete?friendId=${currentUser.id}`).then(
          res => {
            console.log(res)
            loginUser = res.data.data
            console.log(loginUser)
          }
      )
}




//单向拉黑好友
const addBlacklist =()=>{
  request.post("api/friends/black",{
    "friendId":currentUser.friendId
  }).then(
      res => {
        console.log(res)
        loginUser = res.data.data
        console.log(loginUser)
      }
  )
}
const beforeCreate= ()=> {
  axios.defaults.headers.common['authorization'] = window.sessionStorage.getItem("token");
  console.log(sessionStorage.getItem("token"));
  // 获取登录用户userId,请根据自己实际项目获取
  request.get("api/user/login/user")
      .then(
          res => {
            console.log(res)
            loginUser = res.data.data
            console.log(loginUser)
            window.sessionStorage.setItem("user",res.data.data.id)
          }
      )
}
onMounted(() => {
  beforeCreate()
  init()
  initMockData()
  searchAllFriends()
  scrollToBottom()
  searchUserMessage()//默认进入网页当前为消息页
  getAllPending() //查看当前未处理的好友数量
});

// 用户数据
// const loginUser = ref({
//   avatar: 'https://example.com/avatar.jpg'
// })
</script>
<style scoped>


.left-side {
  max-width: 370px;
  position: relative; /* Position relative for absolute positioning */
  flex: 1;
  height: 100vh;
  /*
  padding: 20px;
  */
  border-right: 1px solid #eaeaea;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  max-width: 370px;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #409EFF;
  box-shadow: 0 0 4px rgba(64, 158, 255, 0.3);
}

.contact-search-input{
  flex: 1;
  max-width: 370px;
  padding: 8px 12px;
  font-size: 14px;
  transition: border-color 0.3s;
}
.contact-search-input:focus {
  outline: none;
  border-color: #409EFF;
  box-shadow: 0 0 4px rgba(64, 158, 255, 0.3);
}
.add-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: #909399;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 移除点击态边框 */
.add-btn:focus,
.add-btn:active {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;  /* 双重保障 ‌:ml-citation{ref="4,7" data="citationList"} */
}

/* 按钮悬停动画 */
.add-btn:hover {
  transform: scale(1.1);
  color: #409EFF;
}

/*!* 移动端适配 *!
@media (max-width: 768px) {
  .search-wrapper {
    padding: 8px;
  }

  .search-input {
    max-width: none;
  }
}*/
/* 外层容器 - 禁用滚动并启用弹性布局 */
.user-list-scroll {
  height: 100vh !important; /* 强制视口高度 */
  min-height: 0; /* 允许内容压缩 */
  display: flex;
  flex-direction: column;
  overflow: hidden !important; /* 禁用外部滚动 */

  /* Element 滚动容器修正 */
  .el-scrollbar {
    flex: 1; /* 占据剩余空间 */
    min-height: 0; /* 关键! 解除高度限制 */

    /* 滚动包装层 */
    .el-scrollbar__wrap {
      height: calc(100% + 36px) !important; /* 滚动补偿 */
      max-height: none !important;
      overflow-y: scroll !important;
      padding-bottom: 36px !important; /* 滚动条安全区 */
      scroll-behavior: smooth;
    }

    /* 内容视图层 */
    .el-scrollbar__view {
      min-height: calc(100% + 10px); /* 强制溢出触发滚动 */
      > div {
        padding-bottom: 8px; /* 内容补偿 */
      }
    }
  }

  /* 搜索结果悬浮层特定修正 */
  .user-list-scroll-search {
    .el-scrollbar__wrap {
      padding-bottom: 24px !important; /* 增加补偿 */
    }
  }
}

/* 浏览器兼容方案 */
@supports (-moz-appearance:none) {
  .el-scrollbar__wrap {
    scrollbar-width: thin;
    padding-bottom: 18px !important; /* 火狐滚动条较宽 */
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

/*.search-active + .user-list-scroll {
  filter: blur(1px);
  pointer-events: none;
}*/
/*.user-list-scroll-search{
  height: calc(100% - 40px);
  overflow-y: auto;
}*/
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

/*.user-name {
  font-weight: 800;
  white-space: nowrap; !* 不换行 *!
  overflow: hidden; !* 溢出隐藏 *!
  padding-left: 15px;
  text-overflow: ellipsis; !* 超出显示省略号 *!
  text-align: left; !* 添加左对齐属性 *!
}*/

.user-last-message {
  color: #a19f9f;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  padding-left: 15px;
  text-overflow: ellipsis;
  text-align: left; /* 添加左对齐属性 */
}



/*.chat-header {
  padding: 20px;
  border-bottom: 1px solid #eaeaea;
  font-size: 1.2em;
  color: #37474F;
}*/

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
/* 头部行布局 - 微信样式 */
.header-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  width: 100%;
}

.user-name {
  font-size: 16px;
  color: #191919;
  max-width: 70%;
  white-space: nowrap;
}

.message-time {
  font-size: 12px;
  color: #888;
  flex-shrink: 0;
  margin-left: 8px;
}

/* 消息预览样式 */
.last-message {
  font-size: 11px;
  color: #888;
  text-align: left;
  width: 100%;
  line-height: 1.4;
}

/* 通用截断样式 */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 适配深色模式 */
@media (prefers-color-scheme: dark) {
  .user-name { color: #e5e5e5; }
  .last-message { color: #999; }
  .user-details { border-color: #2d2d2d; }
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
.el-scrollbar {
  height: 100vh;
  overflow: hidden;

  /* 关键容器修正 */
  .el-scrollbar__wrap {
    max-height: 100vh !important; /* 解除默认高度限制 */
    padding-bottom: 8px !important; /* 滚动条安全区 */
    overflow-y: scroll !important; /* 强制启用滚动 */
  }

  .el-scrollbar__view {
    min-height: calc(100% + 1px); /* 强制触发溢出滚动 */
  }
}
/* 容器布局 */
.chat-container {
  display: flex;
  height: 100vh; /* 使用视口高度而非百分比 */
  width: 1280px; /* 固定宽度 */
  overflow: hidden; /* 隐藏滚动条 */

  /* 防止父容器溢出 */
  flex-shrink: 0;
  box-sizing: border-box;

  /*!* 弹性子元素布局 *!
  > * {
    flex: 1;
    min-width: 0; !* 防止弹性元素溢出 *!
  }*/
}

/* 响应式处理 */
@media screen and (max-width: 1280px) {
  .chat-container {
    width: 100vw; /* 小屏幕时占满视口 */
    transform: translateX(0); /* 防止横向滚动 */
  }
}


/*!* 左侧用户列表 *!
.left-side {
  width: 280px;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
}*/

.search-wrapper {
  position: absolute;
  padding: 10px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  gap: 8px; /* 元素间距 */
}

/*.user-list-scroll {
  flex: 1;
  overflow: hidden;
}*/
/*
 //min-width: 400px;
 */
/* 右侧聊天区域 */
.right-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 1330px;
}

/* 聊天头部 */
.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e5e5;
  background: #fafafa;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
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


.nav-side {
  --wechat-bg: #f8f8f8; /* 微信背景色 */
  --wechat-active-bg: #ededed; /* 激活状态背景 */
  --wechat-icon-color: #7f7f7f; /* 默认图标色 */
  --wechat-active-color: #000000; /* 激活状态颜色 */
  --wechat-border-color: #e6e6e6; /* 边框色 */

  background: var(--wechat-bg);
  width: 72px;
  height: 100vh;
  border-right: 1px solid var(--wechat-border-color);
  flex-direction: column;
  box-shadow: 1px 0 6px rgba(0, 0, 0, 0.1);
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-items {
  flex: 1;
  width: 100%;
}

.nav-item {
  padding: 12px;
  margin: 8px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  display: flex;
  justify-content: center;

  &:hover {
    background: #f3f3f3;

    .nav-icon {
      color: #333; /* 悬停时图标颜色加深 */
    }
  }

  &.active {
    background: transparent !important; /* 移除背景色 */

    .nav-icon {
      color: #07c160 !important; /* 激活状态图标变绿 */
      filter: brightness(0.9); /* 颜色加深效果 */
    }
  }
}

/* 图标基础样式 */
.nav-icon {
  color: #666;
  transition: color 0.3s;
}

/* 徽章定位调整 */
.nav-badge,
.message-badge {
  position: absolute;
  top: 6px;
  right: 6px;

  .el-badge__content {
    background: #07c160;
    height: 18px;
    line-height: 18px;
    padding: 0 4px;
    font-size: 12px;
  }
}

/* 用户头像样式 */
.user-avatar {
  border: 2px solid #eaeaea;
  transition: border-color 0.3s;

  &:hover {
    border-color: #07c160;
  }
}


.el-avatar {
  border: 2px solid #eaeaea;
  transition: border-color 0.3s;

  &:hover {
    border-color: #07c160;
  }
}

.nav-icon {
  color: #666;
  transition: color 0.3s;
}

.nav-badge {
  position: absolute;
  top: 4px;
  right: 4px;
}

/*!* 调整左侧内容区 *!
.left-side {
  width: 280px;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
}*/

.sub-header {
  padding: 16px;
  font-weight: 500;
  border-bottom: 1px solid #e5e5e5;
}
/*.user-list-scroll {
  height: 600px;
  --badge-size: 20px;
}*/

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
/* 选中态样式覆盖 */
.active-item {
  background: #f5f7fa !important;
  transition: background 0.3s ease-in-out;
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {
  .user-item.active-item .content-wrapper {
    background: #2d2d2d !important;
  }
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
  top: 4px;
  right: 4px;
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

/*.header-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}*/

/*.user-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}*/

/*.message-time {
  color: #909399;
  font-size: 12px;
  flex-shrink: 0;
  margin-left: 8px;
}*/

/*.last-message {
  color: #606266;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  !* 确保容器不会无限扩展 *!
  max-width: 300px;
  display: flex;
  align-items: center;
  gap: 4px;
}*/
.user-list-scroll-search {
  position: absolute;
  top: 3px; /* 根据搜索框高度调整 */
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

  right: 0;
  bottom: 0;
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

/* 新好友列表弹窗弹窗内容 */
.dialog-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 333;
}

.dialog-title {
  padding: 16px;
  margin: 0;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  color: #303133;
}

/* 申请列表 */
.application-list {
  max-height: 60vh;
  overflow-y: auto;
  padding: 8px 0;
}

/* 单个申请项 */
.application-item {
  display: flex;
  padding: 12px 16px;
  transition: background 0.3s;
}

.application-item:hover {
  background: #fafafa;
}

.user-avatar {
  flex-shrink: 0;
  margin-right: 12px;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex-grow: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.username {
  font-size: 14px;
  color: #303133;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
  max-width: 100%;
}
.username.truncate {
  display: inline-block;
  max-width: 6em; /* 根据字体大小调整，6个中文字约为6em */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
.wechat-id {
  font-size: 12px;
  color: #909399;
}

.apply-reason {
  margin: 0;
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

/* 操作按钮 */
.action-buttons {
  flex-shrink: 0;
  margin-left: 12px;
  display: flex;
  align-items: center;
}

.btn {
  padding: 6px 12px;
  margin-left: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn.accept {
  background: #67c23a;
  color: white;
}

.btn.accept:hover {
  background: #5daf34;
}

.btn.reject {
  background: #f56c6c;
  color: white;
}

.btn.reject:hover {
  background: #e65050;
}

.status-tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-tag.accepted {
  color: #67c23a;
  background: #f0f9eb;
}

.status-tag.rejected {
  color: #f56c6c;
  background: #fef0f0;
}
/*统一搜索框和消息长度*/
/* 添加以下样式 */
.left-chat-container {
  width: 100%; /* 统一容器宽度 */
  height: 100vh;
  box-sizing: border-box;
}

/*.search-wrapper {
  padding: 12px;
  background: #fff;
}*/


/* 统一输入框样式 */
.search-wrapper .el-input {
  width: 100%;

  .el-input__inner {
    border-radius: 4px;
    padding-right: 40px; /* 给清除按钮留空间 */
  }
}

/* 统一用户项间距 */
.user-item {
  padding: 12px;
  margin: 4px 0;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fa;
  }
}

/*发起群聊按钮图标*/
.search-icon {
  cursor: pointer;
  padding: 8px;
  color: #606266;
  transition: color 0.3s;
  left: 70px;
}

.search-icon:hover {
  color: #409EFF;
}


/* 微信风格弹窗样式 */
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/*.dialog-wrapper {
  width: 440px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}*/

/*.dialog-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}*/

.close-btn {
  cursor: pointer;
  font-size: 24px;
  color: #999;
}

/*.dialog-body {
  padding: 20px;
}*/

.input-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.wechat-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.wechat-input:focus {
  border-color: #07C160;
  outline: none;
}

.search-wrapper {
  position: relative;
}



/* 输入框聚焦时显示下拉 */
.wechat-input:focus + .friend-list {
  display: block; /* 纯CSS触发显示 ‌:ml-citation{ref="7" data="citationList"} */
}

/*.friend-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  position: relative; !* 建立定位上下文 *!
}*/

.friend-item:hover {
  background: #f5f5f5; /* 悬停反馈 ‌:ml-citation{ref="3,8" data="citationList"} */
}

.wechat-checkbox {
  margin-right: 12px;
  accent-color: #07C160; /* 复选框品牌色 ‌:ml-citation{ref="1" data="citationList"} */
  opacity: 0; /* 隐藏原生控件 */
  position: absolute;
  width: 18px;
  height: 18px;
}
.checkbox-wrapper {
  position: relative;
  margin-right: 12px;
  z-index: 1; /* 确保层级高于头像 */
}

.checkmark {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}
/* 选中态样式 */
.wechat-checkbox:checked + .checkmark {
  background: #07C160 url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxNiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNS42IDExLjhMMC40IDYuNiAxLjggNS4yIDUuNiA5IDE0LjIgMC40IDE1LjYgMS44IDUuNiAxMS44eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==') no-repeat center;
  background-size: 12px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dialog-footer {
  padding: 16px;
  text-align: right;
  border-top: 1px solid #eee;
}

.confirm-btn, .cancel-btn {
  padding: 8px 24px;
  border-radius: 4px;
  margin-left: 12px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.confirm-btn {
  background: #07C160;
  color: white;
  border: none;
}

.cancel-btn {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.confirm-btn:hover {
  opacity: 0.9;
}







.chat--group-container {
  display: flex;
  width: 800px;
  height: 600px;
  border: 1px solid #e5e5e5;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 左侧面板样式 */
.left-panel {
  width: 280px;
  border-right: 1px solid #e5e5e5;
}

/*.search-box {
  padding: 12px;
  border-bottom: 1px solid #e5e5e5;
}*/

.search-group-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 14px;
}

.friend-list {
  height: calc(100% - 57px);
  overflow-y: auto;
}

/*.friend-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  position: relative;
}

.friend-item:hover {
  background-color: #f5f5f5;
}*/

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.name {
  font-size: 14px;
  color: #333;
}

.check-mark {
  position: absolute;
  right: 15px;
  color: #09bb07;
  font-size: 18px;
}

/* 右侧面板样式 */
.right-panel {
  flex: 1;
  padding: 16px;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  font-size: 14px;
  color: #999;
}

.clear-btn {
  color: #576b95;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  max-height: 450px;
  overflow-y: auto;
}

.selected-item {
  width: 80px;
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 4px;
}

.remove-icon {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  background: #ff4d4f;
  color: white;
  border-radius: 50%;
  font-size: 14px;
  line-height: 18px;
  cursor: pointer;
}

.action-area {
  border-top: 1px solid #e5e5e5;
  padding-top: 16px;
}

.group-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  margin-bottom: 12px;
}

.submit-btn {
  width: 100%;
  padding: 10px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.submit-btn:hover {
  background: #06ad56;
}


/* 微信风格基础样式 */
.wechat-style {
  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
  color: #333;
}

/* 遮罩层 */
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.dialog-wrapper {
  width: 680px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

/* 标题栏 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e5e5;

  .title {
    font-size: 17px;
    font-weight: 500;
  }

  .close-btn {
    font-size: 24px;
    color: #999;
    cursor: pointer;
    padding: 0 8px;

    &:hover {
      color: #666;
    }
  }
}

/* 内容区布局 */
.dialog-body {
  display: flex;
  height: 420px;
}

/* 左侧面板 */
.left-panel {
  width: 280px;
  border-right: 1px solid #e5e5e5;

  .search-box {
    padding: 16px;
  }

  .wechat-search {
    width: 100%;
    height: 32px;
    padding: 0 12px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      border-color: #07c160;
    }
  }
}

.friend-list {
  height: calc(100% - 64px);
  overflow-y: auto;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  position: relative;

  &:hover {
    background: #f5f5f5;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    margin-right: 12px;
  }

  .name {
    font-size: 16px;
  }

  .selection-mark {
    position: absolute;
    right: 3px;
    width: 20px;
    height: 20px;
    border: 1px solid #ddd;
    border-radius: 50%;

    .check-icon {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 12px;
      height: 6px;
      border: 2px solid #07c160;
      border-top: none;
      border-right: none;
      transform: rotate(-45deg);
    }
  }
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .text {
    color: #999;
    font-size: 14px;
  }

  .clear-btn {
    color: #576b95;
    background: none;
    border: none;
    cursor: pointer;
  }
}

.selected-list {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 12px;
  overflow-y: auto;
}

.selected-item {
  width: 72px;
  text-align: center;

  .avatar-wrapper {
    position: relative;
    margin-bottom: 4px;

    .user-avatar {
      width: 56px;
      height: 56px;
      border-radius: 4px;
    }

    .remove-btn {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 20px;
      height: 20px;
      background: #ff4d4f;
      color: white;
      border-radius: 50%;
      font-size: 16px;
      line-height: 18px;
      cursor: pointer;
    }
  }

  .name {
    font-size: 12px;
    color: #666;
    display: block;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
}

.group-input {
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;

  .wechat-input {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      border-color: #07c160;
    }
  }
}

/* 底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #e5e5e5;
  .wechat-btn {
    height: 36px;
    padding: 0 24px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;

    &.cancel {
      background: #f5f5f5;
      color: #666;

      &:hover {
        background: #eee;
      }
    }

    &.primary {
      background: #07c160;
      color: white;

      &:hover {
        background: #06ad56;
      }
    }
  }
}
/* 抽屉样式 */
.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  transition: opacity 0.3s;
}

.drawer-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background: white;
  transform: translateX(100%);
  transition: transform 0.3s;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.drawer-container.show {
  transform: translateX(0);
}

.drawer-content {
  padding: 16px;
}

/* 群成员样式 */
.group-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}

.member-item {
  height: 70px;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.3s;
}

.member-item:hover {
  background: #f5f5f5;
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  margin-right: 12px;
}



/* 操作列表样式 */
.action-list {
  margin-top: 20px;
}

.action-item {
  padding: 12px;
  border-radius: 6px;
  transition: background 0.3s;
  cursor: pointer;
}

.action-item:hover {
  background: #f5f5f5;
}

.text-danger {
  color: #ff4d4f;
}

.action-item + .action-item {
  margin-top: 8px;
}
/*聊天框*/
/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 4px;
  opacity: 1 !important;
  visibility: visible !important;
}
/* 修复工具栏布局 */
.left-tools, .right-tools {
  display: flex !important;  /* 解除注释并增强权重 */
  gap: 8px;
}

/* 优化按钮容器 */
.tool-btn {
  position: relative;  /* 为图标定位提供基准 */
  background: transparent !important;  /* 清除可能存在的背景色 */
}

/* 重定义图标样式 */
.icon {
  display: block;
  width: 24px;
  height: 24px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-size: contain;
  background-repeat: no-repeat;
}

/* 添加颜色变量 */
:root {
  --icon-color: #000000;
  --icon-hover: #07C160;
}

/* 动态颜色控制 */
.tool-btn:hover .icon {
  filter: brightness(0.85);
}

/* 更新所有图标URL的fill值 */
.icon.voice {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000000' d='M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93A7.33 7.33 0 0 1 5 11H3c0 3.07 2.24 5.62 5.13 6h.75c3.53 0 6.43-2.61 6.92-6h-2.02c-.48 2.28-2.4 4-4.78 4s-4.3-1.72-4.78-4H5c0 3.31 2.69 6 6 6v3h2v-3.07z'/%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
}

/* 其他图标同理更新fill值为var(--icon-color)的URL编码 */


/* 键盘图标 */
.icon.keyboard {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000000' d='M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm4 10H8v-1c0-2 4-3.1 4-3.1s4 1.1 4 3.1v1z'/%3E%3C/svg%3E");
}

/* 表情图标 */
.icon.emoji {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000000' d='M12 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm0-18c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8z'/%3E%3Ccircle cx='8.5' cy='10.5' r='1.5'/%3E%3Ccircle cx='15.5' cy='10.5' r='1.5'/%3E%3Cpath d='M12 17c-2.003 0-3.863-1.012-4.982-2.682l-1.743.97C6.314 17.325 8.974 19 12 19s5.686-1.675 6.725-4.712l-1.743-.97C15.863 15.988 14.003 17 12 17z'/%3E%3C/svg%3E");
}

/* 文件图标 */
.icon.file {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000000' d='M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z'/%3E%3C/svg%3E");
}

/* 视频图标 */
.icon.video {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000000' d='M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z'/%3E%3C/svg%3E");
}

/* 电话图标 */
.icon.phone {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000000' d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'/%3E%3C/svg%3E");
}

/* 输入区域 */
.input-area {
  margin-top: 8px;
}

/* 语音按钮 */
.voice-mode {
  display: flex;
  justify-content: center;
}

.voice-btn {
  width: 100%;
  height: 40px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  background: #fff;
  color: #666;
  font-size: 14px;
  transition: all 0.2s;
}

.voice-btn:hover {
  background: #f0f0f0;
}

/* 文本输入框 */
.text-mode {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
  min-height: 40px;
  max-height: 120px;
  padding: 8px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: #07c160;
  box-shadow: 0 0 0 2px rgba(7, 193, 96, 0.1);
}

.send-btn {
  padding: 6px 16px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.send-btn:hover {
  background: #06ad56;
}

/* 表情面板 */
.emoji-panel {
  position: absolute;
  bottom: 60px;
  background: white;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.emoji-item {
  cursor: pointer;
  padding: 4px;
  font-size: 24px;
  text-align: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.emoji-item:hover {
  background: #f5f5f5;
}

.hidden-file {
  display: none;
}
</style>
