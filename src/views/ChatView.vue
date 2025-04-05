<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// 类型定义
interface NavItem {
  id: 'profile' | 'messages' | 'contacts' | 'moments' | 'settings'
  icon: string
  name: string
  badge?: number
}

interface Message {
  id: number
  sender: string
  content: string
  time: string
  unread: boolean
}

interface Contact {
  id: number
  name: string
  avatar: string
  latestMessage?: string
}

// 状态管理
const activeNav = ref<NavItem['id']>('profile')
const selectedChat = ref<Contact | null>(null)

// 模拟数据
const navItems = reactive<NavItem[]>([
  { id: 'profile', icon: '👤', name: '个人资料' },
  { id: 'messages', icon: '💬', name: '消息', badge: 3 },
  { id: 'contacts', icon: '👥', name: '通讯录' },
  { id: 'moments', icon: '📷', name: '朋友圈' },
  { id: 'settings', icon: '⚙️', name: '设置' }
])

const messages = reactive<Message[]>([
  { id: 1, sender: '张三', content: '你好！', time: '10:30', unread: true },
  { id: 2, sender: '李四', content: '项目进展如何？', time: '11:15', unread: false }
])

const contacts = reactive<Contact[]>([
  { id: 1, name: '张三', avatar: 'https://via.placeholder.com/40' },
  { id: 2, name: '李四', avatar: 'https://via.placeholder.com/40' }
])

// 计算属性
const showMainContent = computed(() =>
    ['messages', 'contacts'].includes(activeNav.value)
)

// 方法
const handleNavClick = (item: NavItem) => {
  activeNav.value = item.id
  if (!showMainContent.value) {
    selectedChat.value = null
  }
}

const selectContact = (contact: Contact) => {
  selectedChat.value = contact
}
</script>

<template>
  <div class="wechat-layout">
    <!-- 左侧导航 -->
    <div class="left-nav">
      <div
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: activeNav === item.id }"
          @click="handleNavClick(item)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span v-if="item.badge" class="badge"></span>
      </div>
    </div>

    <!-- 中间内容区 -->
    <div class="main-content">
      <div v-if="activeNav === 'messages'" class="message-list">
        <div class="header">消息列表</div>
        <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-item"
            @click="selectContact({ id: msg.id, name: msg.sender, avatar: '' })"
        >
          <div class="avatar">👤</div>
          <div class="content">
            <h4>{{ msg.sender }}</h4>
            <p>{{ msg.content }}</p>
          </div>
          <div class="meta">
            <span class="time">{{ msg.time }}</span>
            <span v-if="msg.unread" class="unread"></span>
          </div>
        </div>
      </div>

      <div v-if="activeNav === 'contacts'" class="contact-list">
        <div class="header">通讯录</div>
        <div
            v-for="contact in contacts"
            :key="contact.id"
            class="contact-item"
            @click="selectContact(contact)"
        >
          <img :src="contact.avatar" class="avatar">
          <span>{{ contact.name }}</span>
        </div>
      </div>

      <div v-if="!showMainContent" class="default-view">
        <div class="header">{{ navItems.find(n => n.id === activeNav)?.name }}</div>
        <p>请选择具体内容进行查看</p>
      </div>
    </div>

    <!-- 右侧聊天区 -->
    <div class="right-panel">
      <div v-if="selectedChat" class="chat-window">
        <div class="chat-header">
          <img :src="selectedChat.avatar" class="avatar">
          <h3>{{ selectedChat.name }}</h3>
        </div>
        <div class="chat-messages">
          <div
              v-for="msg in messages"
              :key="msg.id"
              class="message-bubble"
              :class="{ own: msg.sender === '我' }"
          >
            <p>{{ msg.content }}</p>
            <span class="time">{{ msg.time }}</span>
          </div>
        </div>
        <div class="chat-input">
          <textarea placeholder="输入消息..."></textarea>
          <button>发送</button>
        </div>
      </div>
      <div v-else class="empty-chat">
        请选择聊天对象
      </div>
    </div>
  </div>
</template>

<style>
/* 基础布局 */
.wechat-layout {
  display: flex;
  height: 100vh;
  background: #f0f0f0;
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
}

/* 左侧导航样式 */
.left-nav {
  width: 80px;
  background: #2d2f34;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.nav-item {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-icon {
  font-size: 24px;
  color: #b3b3b3;
}

.nav-item.active {
  background: #07c160;
}

.nav-item.active .nav-icon {
  color: white;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #f56c6c;
  border: 2px solid #2d2f34;
}

/* 中间内容区 */
.main-content {
  width: 300px;
  background: white;
  border-right: 1px solid #e5e5e5;
}

.header {
  padding: 15px;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 1px solid #eee;
}

.message-item, .contact-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.message-item:hover, .contact-item:hover {
  background: #f5f5f5;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  margin-right: 12px;
}

/* 右侧聊天区 */
.right-panel {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f3f3f3;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  background: white;
  position: relative;
}

.message-bubble.own {
  background: #95ec69;
  margin-left: auto;
}

.empty-chat {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #eee;
}

.chat-input textarea {
  width: 100%;
  height: 60px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
}

.chat-input button {
  margin-top: 10px;
  padding: 8px 20px;
  background: #07c160;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  float: right;
}
</style>
<!--这个实现还可以-->