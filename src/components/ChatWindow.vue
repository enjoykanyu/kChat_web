<template>
  <div class="chat-window">
    <div class="chat-header">
      <img :src="chat.avatar" class="chat-avatar" alt="Avatar" />
      <div class="chat-info">
        <h3>{{ chat.name }}</h3>
        <small>{{ chat.lastMessageTime }}</small>
      </div>
    </div>
    <div class="chat-messages" ref="messagesContainer">
      <div
          v-for="(message, index) in chat.messages"
          :key="index"
          class="chat-message"
          :class="{ 'sent-by-me': message.sent }"
      >
        <div class="message-content">
          <p>{{ message.text }}</p>
          <small>{{ message.time }}</small>
        </div>
      </div>
    </div>
    <div class="chat-input">
      <textarea v-model="newMessage" placeholder="输入消息..." @keyup.enter="sendMessage" />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Chat {
  id: number
  name: string
  avatar: string
  messages: { text: string; time: string; sent: boolean }[]
  lastMessageTime?: string
}

const props = defineProps<{ chat: Chat }>()
const emit = defineEmits<{ (e: 'send-message', message: string): void }>()

const newMessage = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)

// 自动滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 监听消息变化并滚动到底部
watch(
    () => props.chat.messages,
    () => {
      scrollToBottom()
    },
    { deep: true, immediate: true }
)

// 发送消息
const sendMessage = () => {
  if (newMessage.value.trim()) {
    const currentTime = new Date().toLocaleTimeString()
    emit('send-message', newMessage.value)
    props.chat.messages.push({
      text: newMessage.value,
      time: currentTime,
      sent: true,
    })
    newMessage.value = ''
    // 更新最后消息时间（模拟，实际应在父组件处理）
    props.chat.lastMessageTime = currentTime
  }
}

// 组件挂载时滚动到底部
onMounted(scrollToBottom)
</script>

<style scoped>
.chat-window {
  flex: 1;
  background: #fff;
  border-left: 1px solid #ddd;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #f0f2f5;
  border-bottom: 1px solid #ddd;
}

.chat-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 16px;
}

.chat-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.chat-info small {
  font-size: 12px;
  color: #999;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.chat-message {
  margin-bottom: 16px;
}

.sent-by-me .message-content {
  background: #dcf8c6;
  border-radius: 8px;
  padding: 8px 16px;
  align-self: flex-end;
}

.message-content p {
  margin: 0;
}

.message-content small {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.chat-input {
  display: flex;
  padding: 16px;
  background: #f0f2f5;
  border-top: 1px solid #ddd;
}

.chat-input textarea {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  font-size: 14px;
}

.chat-input button {
  margin-left: 16px;
  padding: 8px 16px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
