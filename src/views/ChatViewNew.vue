<template>
  <div class="app-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="global-loading">
      <div class="loading-spinner"></div>
      <p>数据加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="global-error">
      <p>⚠️ 数据加载失败，显示演示数据</p>
    </div>

    <!-- 正常状态 -->
    <template v-else>
      <!-- 左侧导航 -->
      <nav-bar :active-tab="activeTab" @tab-change="handleTabChange" />

      <!-- 中间内容区 -->
      <main-content
          :active-tab="activeTab"
          :messages="messages"
          :contacts="contacts"
          @select-chat="handleSelectChat"
      />

      <!-- 右侧聊天区 -->
      <chat-window
          v-if="activeChat"
          :chat="activeChat"
          @send-message="handleSendMessage"
      />
      <div v-else class="empty-chat">
        <div class="empty-content">
          <i class="icon-chat">💬</i>
          <p>选择对话开始聊天</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import MainContent from '../components/MainContent.vue'
import ChatWindow from '../components/ChatWindow.vue'
import {
  fetchMessages,
  fetchContacts,
  sendMessage
} from '../utils/api'

interface Message {
  id: number
  name: string
  avatar: string
  preview: string
  time: string
  unread: number
  messages: ChatMessage[]
}

interface Contact {
  id: number
  name: string
  avatar: string
  initial: string
}

interface ChatMessage {
  text: string
  time: string
  sent: boolean
}

// 响应式数据
const activeTab = ref('messages')
const activeChat = ref<Message | null>(null)
const messages = ref<Message[]>([])
const contacts = ref<Contact[]>([])
const loading = ref(true)
const error = ref(false)

// 获取初始化数据
const initData = async () => {
  try {
    // 并行请求消息和联系人
    const [msgRes, contactRes] = await Promise.all([
      fetchMessages(),
      fetchContacts()
    ])

    // 处理消息数据
    messages.value = msgRes.data?.length ?
        msgRes.data : generateFallbackMessages()

    // 处理联系人数据
    contacts.value = contactRes.data?.length ?
        contactRes.data : generateFallbackContacts()
  } catch (err) {
    console.error('数据加载失败:', err)
    error.value = true
    messages.value = generateFallbackMessages()
    contacts.value = generateFallbackContacts()
  } finally {
    loading.value = false
  }
}

// 生成虚拟消息数据
const generateFallbackMessages = (): Message[] => [{
  id: 1,
  name: "虚拟用户",
  avatar: "https://picsum.photos/45",
  preview: "这是虚拟消息示例",
  time: new Date().toLocaleTimeString(),
  unread: 0,
  messages: [{
    text: "虚拟初始化消息",
    time: new Date().toLocaleTimeString(),
    sent: false
  }]
}]

// 生成虚拟联系人数据
const generateFallbackContacts = (): Contact[] => [{
  id: 1,
  name: "虚拟联系人",
  avatar: "https://picsum.photos/45",
  initial: "V"
}]

// 消息发送处理
const handleSendMessage = async (text: string) => {
  if (!activeChat.value || !text.trim()) return

  try {
    // 乐观更新
    const tempMessage = {
      text: text,
      time: new Date().toLocaleTimeString(),
      sent: true
    }
    activeChat.value.messages.push(tempMessage)

    // 实际发送到后端
    const res = await sendMessage({
      chatId: activeChat.value.id,
      text: text
    })

    // // 替换临时消息
    // const index = activeChat.value.messages.findIndex(
    //     m => m === tempMessage
    // )
    // if (index > -1) {
    //   activeChat.value.messages.splice(index, 1, res.data)
    // }
  } catch (err) {
    console.error('消息发送失败:', err)
    // 回滚消息
    activeChat.value.messages.pop()
  }
}

// 其他事件处理保持不变
const handleTabChange = (tab: string) => {
  activeTab.value = tab
  activeChat.value = null
}

const handleSelectChat = (chat: Message) => {
  activeChat.value = chat
  if (activeChat.value) {
    activeChat.value.unread = 0
  }
}

// 初始化数据
onMounted(initData)
</script>

<style>
.app-container {
  display: flex;
  height: 100vh;
  position: relative;
}

.global-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.global-error {
  padding: 20px;
  background: #ffeeba;
  color: #856404;
  border-radius: 4px;
  margin: 20px;
}
</style>
