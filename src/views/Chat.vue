<template>
  <div class="wechat-container">
    <!-- 顶部标题栏 -->
    <div class="chat-header">
      <div class="header-left">
        <span class="back-btn">‹</span>
        <div class="user-info">
          <div class="header-avatar">好友</div>
          <div class="user-detail">
            <h3 class="username">微信用户</h3>
            <span class="online-status">在线</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息主体区域 -->
    <div class="chat-main">
      <div class="message-list">
        <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message-item', { 'self': msg.sender === 'me' }]"
        >
          <!-- 对方消息显示头像和用户名 -->
          <template v-if="msg.sender === 'other'">
            <div class="user-avatar">
              <div class="avatar">好友</div>
              <span class="username">{{ msg.senderName }}</span>
            </div>
          </template>

          <div class="message-content">
            <!-- 消息内容部分 -->
            <div class="message-bubble">
              <!-- 文本消息 -->
              <div v-if="msg.type === 'text'" class="text-message">
                {{ msg.content }}
                <span class="emoji" v-if="msg.emoji">{{ getEmoji(msg.emoji) }}</span>
              </div>

              <!-- 媒体消息 -->
              <img v-if="msg.type === 'image'" :src="msg.content" class="media-message">
              <video v-if="msg.type === 'video'" :src="msg.content" class="media-message" controls></video>
            </div>

            <!-- 消息元信息 -->
            <div class="message-meta">
              <span class="time">{{ formatTime(msg.timestamp) }}</span>
              <span v-if="msg.status === 'unread'" class="unread-badge"></span>
            </div>
          </div>

          <!-- 自己消息显示状态标识 -->
          <div v-if="msg.sender === 'me'" class="message-status">
            <span v-if="msg.status === 'unread'" class="unread-dot"></span>
            <span class="time">{{ formatTime(msg.timestamp) }}</span>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="emoji-btn" @click="showEmojiPicker = !showEmojiPicker">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-3-5h2a3 3 0 0 0 6 0h2a5 5 0 0 1-10 0zm-3.5-3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm7 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
            </svg>
          </button>
          <label class="file-input-btn">
            <input type="file" @change="handleFileUpload" multiple>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5h2v5h11v-5h2zm-5-4v4h-2V9H8l4-4 4 4h-4z"/>
            </svg>
          </label>
        </div>

        <!-- 输入框区域 -->
        <div class="input-wrapper">
          <!-- 表情面板 -->
          <div v-if="showEmojiPicker" class="emoji-panel">
            <span
                v-for="(emoji, key) in emojis"
                :key="key"
                @click="addEmoji(key)"
            >{{ emoji }}</span>
          </div>

          <!-- 输入框 -->
          <textarea
              v-model="inputText"
              @keyup.enter.exact="sendMessage"
              placeholder="输入消息..."
          ></textarea>
          <button class="send-btn" @click="sendMessage">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'

// 类型定义
interface Message {
  id: number
  sender: 'me' | 'other'
  type: 'text' | 'image' | 'video' | 'emoji'
  content: string
  timestamp: number
  status?: 'unread' | 'read'
  emoji?: string
  senderName: string;
}

// 虚拟数据
const messages = reactive<Message[]>([
  {
    id: 1,
    sender: 'other',
    type: 'text',
    content: '你好！今天怎么样？',
    timestamp: Date.now() - 3600000,
    status: 'read',
    senderName: '好友昵称',

  },
  {
    id: 2,
    sender: 'me',
    type: 'text',
    content: '还不错，刚拍了个视频',
    timestamp: Date.now() - 1800000,
    status: 'read',
    senderName: '好友昵称',

  },
  {
    id: 3,
    sender: 'me',
    type: 'video',
    content: '/demo-video.mp4',
    timestamp: Date.now() - 900000,
    status: 'unread',
    senderName: '好友昵称',

  }
])

const inputText = ref('')
const showEmojiPicker = ref(false)
const emojis = reactive({
  smile: '😀',
  heart: '❤️',
  thumbsup: '👍',
  // 更多表情...
})

// 发送消息
const sendMessage = () => {
  if (!inputText.value.trim()) return

  const newMessage: Message = {
    id: messages.length + 1,
    sender: 'me',
    type: 'text',
    content: inputText.value,
    timestamp: Date.now(),
    status: 'unread'
  }

  messages.push(newMessage)
  inputText.value = ''
}

// 处理文件上传
const handleFileUpload = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return

  Array.from(files).forEach(file => {
    const type = file.type.startsWith('image') ? 'image' : 'video'
    const url = URL.createObjectURL(file)

    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'me',
      type,
      content: url,
      timestamp: Date.now(),
      status: 'unread'
    }

    messages.push(newMessage)
  })
}

// 添加表情
const addEmoji = (key: string) => {
  inputText.value += emojis[key]
  showEmojiPicker.value = false
}

// 工具函数
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const getEmoji = (key: string) => {
  return emojis[key] || ''
}
</script>

<style>
.wechat-container {
  width: 100%;
  height: 100vh;
  background: #f1f1f1;
  display: flex;
  flex-direction: column;
}

/* 顶部标题栏 */
.chat-header {
  background: #ededed;
  padding: 10px 16px;
  border-bottom: 1px solid #d9d9d9;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-btn {
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.user-detail {
  line-height: 1.3;
}

.username {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.online-status {
  font-size: 12px;
  color: #666;
}

/* 消息主体区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
}

.message-item.self {
  flex-direction: row-reverse;
}

/* 用户头像区域 */
.user-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #e5e5e5;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.username {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  white-space: nowrap;
}

/* 消息气泡 */
.message-bubble {
  max-width: 480px;
  min-width: 80px;
}

.text-message {
  background: white;
  padding: 10px 14px;
  border-radius: 6px;
  line-height: 1.5;
  font-size: 14px;
  word-break: break-word;
  white-space: pre-wrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.message-item.self .text-message {
  background: #95ec69;
  border-radius: 6px;
}

/* 输入区域 */
.input-area {
  background: white;
  border-top: 1px solid #e5e5e5;
  padding: 12px 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding: 0 8px 8px;
}

button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.file-input-btn input {
  display: none;
}

/* 图标按钮样式 */
.emoji-btn svg,
.file-input-btn svg {
  fill: #666;
  transition: all 0.2s;
}

.emoji-btn:hover svg,
.file-input-btn:hover svg {
  fill: #07c160;
}

/* 输入框区域 */
.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

textarea {
  flex: 1;
  min-height: 40px;
  max-height: 100px;
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
}

.send-btn {
  background: #07c160;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  transition: background 0.2s;
}

.send-btn:hover {
  background: #06ad56;
}

/* 表情面板 */
.emoji-panel {
  position: absolute;
  bottom: 60px;
  right: 16px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.emoji-panel span {
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  transition: all 0.1s;
}

.emoji-panel span:hover {
  transform: scale(1.1);
  background: #f5f5f5;
}
.message-list {
  padding: 20px 16px;
}
@media (max-width: 480px) {
  .message-bubble {
    max-width: 80%;
  }
}

</style>