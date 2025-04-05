<template>
  <div class="main-content">
    <!-- 消息列表 -->
    <div v-if="activeTab === 'messages'" class="message-container">
      <div class="header">微信</div>
      <div class="message-list">
        <div
            v-for="message in messages"
            :key="message.id"
            class="message-item"
            @click="$emit('select-chat', message)"
        >
          <img :src="message.avatar" class="message-avatar">
          <div class="message-info">
            <div class="message-header">
              <span class="message-name">{{ message.name }}</span>
              <span class="message-time">{{ message.time }}</span>
            </div>
            <div class="message-preview">{{ message.preview }}</div>
          </div>
          <div v-if="message.unread" class="unread-badge">
            {{ message.unread }}
          </div>
        </div>
      </div>
    </div>

    <!-- 联系人列表 -->
    <div v-else-if="activeTab === 'contacts'" class="contact-container">
      <div class="header">通讯录</div>
      <div class="contact-list">
        <div
            v-for="contact in contacts"
            :key="contact.id"
            class="contact-item"
        >
          <img :src="contact.avatar" class="contact-avatar">
          <span class="contact-name">{{ contact.name }}</span>
        </div>
      </div>
    </div>

    <!-- 默认视图 -->
    <div v-else class="default-view">
      <div class="header">微信</div>
      <div class="empty-content">
        <i class="icon">📱</i>
        <p>请从左侧选择功能</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeTab: string
  messages: any[]
  contacts: any[]
}>()

defineEmits(['select-chat'])
</script>

<style>
.main-content {
  width: 300px;
  background: white;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px;
  font-size: 18px;
  font-weight: 500;
  border-bottom: 1px solid #eee;
}

.empty-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  transition: background 0.2s;
}

.contact-item:hover {
  background: #f5f5f5;
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  margin-right: 12px;
}

.contact-name {
  font-size: 16px;
  color: #222;
}
</style>
