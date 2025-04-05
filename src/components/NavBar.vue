<template>
  <div class="nav-bar">
    <div
        v-for="tab in tabs"
        :key="tab.id"
        class="nav-item"
        :class="{ active: activeTab === tab.id }"
        @click="$emit('tab-change', tab.id)"
    >
      <img v-if="tab.id === 'profile'" :src="profileAvatar" class="avatar">
      <span v-else class="icon">{{ tab.icon }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeTab: string
}>()

const emit = defineEmits(['tab-change'])

const profileAvatar = 'https://picsum.photos/40'
const tabs = [
  { id: 'profile', icon: '👤' },
  { id: 'messages', icon: '💬' },
  { id: 'contacts', icon: '👥' },
  { id: 'moments', icon: '📷' },
  { id: 'settings', icon: '⚙️' }
]
</script>

<style>
.nav-bar {
  width: 80px;
  background: #2d2d2d;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-item {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background: #07c160;
}

.nav-item .icon {
  font-size: 24px;
  color: #fff;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
}
</style>
