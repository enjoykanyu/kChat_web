<template>
  <div class="container" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
    <!-- 视频容器 -->
    <div class="video-wrapper" :class="currentVideo.isLandscape ? 'landscape' : 'portrait'">
      <video
          ref="videoElement"
          :src="currentVideo.url"
          autoplay
          loop
          @timeupdate="updateProgress"
          @click="handleVideoClick"
          @dblclick="handleLike"
      ></video>

      <!-- 暂停图标 -->
      <transition name="fade">
        <div v-if="!isPlaying" class="pause-icon">⏸</div>
      </transition>

      <!-- 进度条 -->
      <div class="progress-container">
        <div class="video-info">
          <h3>@{{ currentVideo.author }}</h3>
          <p>{{ currentVideo.title }}</p>
          <div class="tags">
            <span v-for="tag in currentVideo.tags" :key="tag">#{{ tag }}</span>
          </div>
        </div>
        <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            v-model="progress"
            @input="handleSeek"
            class="progress-bar"
        >
      </div>

      <!-- 弹幕容器 -->
      <div class="danmaku-container">
        <div
            v-for="danmu in visibleDanmus"
            :key="danmu.id"
            class="danmu"
            :style="{
            top: `${danmu.position}%`,
            animationDuration: `${danmu.duration}s`
          }"
        >{{ danmu.text }}</div>
      </div>
    </div>

    <!-- 右侧交互区 -->
    <div class="interaction-panel">
      <div class="user-section">
        <img
            :src="currentVideo.authorAvatar"
            class="avatar"
            @click="navigateToProfile"
        >
        <button
            class="follow-btn"
            @click="toggleFollow"
            :class="{ followed: currentVideo.isFollowing }"
        >+</button>
      </div>

      <div class="action-buttons">
        <div class="action-item" @click="handleLike">
          <div class="icon-wrapper">
            <transition name="scale">
              <div v-if="currentVideo.isLiked" class="icon">❤️</div>
              <div v-else class="icon">🤍</div>
            </transition>
          </div>
          <div class="count">{{ currentVideo.likes }}</div>
        </div>

        <div class="action-item" @click="handleCollect">
          <div class="icon-wrapper">
            <transition name="scale">
              <div v-if="currentVideo.isCollected" class="icon">⭐</div>
              <div v-else class="icon">☆</div>
            </transition>
          </div>
          <div class="count">{{ currentVideo.collects }}</div>
        </div>

        <div class="action-item" @click="toggleComments">
          <div class="icon-wrapper">
            <div class="icon">💬</div>
          </div>
          <div class="count">{{ currentVideo.comments }}</div>
        </div>
      </div>
    </div>
  </div></template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

interface Video {
  id: number
  url: string
  isLandscape: boolean
  author: string
  authorAvatar: string
  title: string
  tags: string[]
  likes: number
  collects: number
  comments: number
  isLiked: boolean
  isCollected: boolean
  isFollowing: boolean
}

interface Danmaku {
  id: number
  text: string
  position: number
  duration: number
  time: number
}

const videos = reactive<Video[]>([
  {
    id: 1,
    url: 'https://www.runoob.com/try/demo_source/movie.mp4',
    isLandscape: true,
    author: 'user1',
    authorAvatar: 'https://picsum.photos/50',
    title: '第一个测试视频',
    tags: ['测试', '演示'],
    likes: 100,
    collects: 50,
    comments: 30,
    isLiked: false,
    isCollected: false,
    isFollowing: false
  },
  {
    id: 2,
    url: 'https://www.runoob.com/try/demo_source/movie.mp4',
    isLandscape: true,
    author: 'user2',
    authorAvatar: 'https://picsum.photos/60',
    title: '第个测试视频',
    tags: ['新', '来'],
    likes: 301,
    collects: 33,
    comments: 3,
    isLiked: false,
    isCollected: false,
    isFollowing: false
  },
  // 添加更多虚拟视频...
])

const currentIndex = ref(0)
const videoElement = ref<HTMLVideoElement>()
const isPlaying = ref(true)
const progress = ref(0)
const showDanmakuInput = ref(false)
const newDanmaku = ref('')
const danmakuList = reactive<Danmaku[]>([])
const touchStartY = ref(0)

const currentVideo = computed(() => videos[currentIndex.value])

// 视频控制逻辑
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (videoElement.value) {
    isPlaying.value ? videoElement.value.play() : videoElement.value.pause()
  }
}

const updateProgress = () => {
  if (videoElement.value) {
    progress.value = (videoElement.value.currentTime / videoElement.value.duration) * 100
  }
}

const handleSeek = (e: Event) => {
  if (videoElement.value) {
    const target = e.target as HTMLInputElement
    const time = (Number(target.value) / 100) * videoElement.value.duration
    videoElement.value.currentTime = time
  }
}

// 交互逻辑
const handleLike = () => {
  currentVideo.value.isLiked = !currentVideo.value.isLiked
  currentVideo.value.likes += currentVideo.value.isLiked ? 1 : -1
}

const handleCollect = () => {
  currentVideo.value.isCollected = !currentVideo.value.isCollected
  currentVideo.value.collects += currentVideo.value.isCollected ? 1 : -1
}

const toggleFollow = () => {
  currentVideo.value.isFollowing = !currentVideo.value.isFollowing
}

// 弹幕逻辑
const visibleDanmus = computed(() => {
  const currentTime = videoElement.value?.currentTime || 0
  return danmakuList.filter(d =>
      d.time <= currentTime &&
      d.time + d.duration > currentTime
  )
})

const sendDanmaku = () => {
  if (newDanmaku.value.trim()) {
    danmakuList.push({
      id: Date.now(),
      text: newDanmaku.value,
      position: Math.random() * 80 + 10,
      duration: 5,
      time: videoElement.value?.currentTime || 0
    })
    newDanmaku.value = ''
    showDanmakuInput.value = false
  }
}

const handleTouchStart = (e: TouchEvent) => {
  // 确保存在有效触摸点
  if (e.touches.length === 0) return
  console.log(e.touches)
  // 正确获取第一个触摸点的坐标
  touchStartY.value = e.touches[0].clientY
  console.log('起始坐标:', touchStartY.value)
}

// const handleTouchEnd = (e: TouchEvent) => {
//   // 确保存在结束触摸点
//   if (e.changedTouches.length === 0) return
//
//   // 正确获取结束坐标
//   const endY = e.changedTouches[0].clientY
//   console.log('结束坐标:', endY)
//
//   // 计算滑动距离
//   const deltaY = endY - touchStartY.value
//   console.log('滑动距离:', deltaY)
// }

const handleTouchEnd = (e: TouchEvent) => {
  const deltaY = e.changedTouches[0].clientY - touchStartY.value
  console.log(deltaY)
  if (Math.abs(deltaY) > 50) {
    if (deltaY > 0) {
      // 上滑加载前一个
      currentIndex.value = Math.max(0, currentIndex.value - 1)
    } else {
      // 下滑加载下一个
      currentIndex.value = Math.min(videos.length - 1, currentIndex.value + 1)
    }
    isPlaying.value = true
    progress.value = 0
  }
}
// const handleTouchEnd = (e: TouchEvent) => {
//   // 确保存在有效触摸点
//   if (e.changedTouches.length === 0) return
//
//   // 正确获取起始和结束坐标
//   const startY = touchStartY.value
//   console.log(startY)
//   const endY = e.changedTouches.clientY
//   const deltaY = endY - startY
//   console.log(deltaY)
//   // 添加滑动方向阈值验证
//   const SWIPE_THRESHOLD = 50
//   const isValidSwipe = Math.abs(deltaY) > SWIPE_THRESHOLD
//
//   if (isValidSwipe) {
//     if (deltaY > 0) {
//       // 上滑加载前一个
//       currentIndex.value = Math.max(0, currentIndex.value - 1)
//     } else {
//       // 下滑加载下一个
//       currentIndex.value = Math.min(videos.length - 1, currentIndex.value + 1)
//     }
//     resetVideoState()
//   }
// }
// 双击检测
let lastClick = 0
const handleVideoClick = () => {
  const now = Date.now()
  if (now - lastClick < 300) {
    handleLike()
  } else {
    togglePlay()
  }
  lastClick = now
}

onMounted(() => {
  if (videoElement.value) {
    videoElement.value.loop = true
  }
})
// 增加

</script>

<style scoped>
/* 优化后的样式 */
.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

video {
  position: absolute;
  max-width: 100%;
  max-height: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 进度条容器 */
.progress-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px;
  background: linear-gradient(transparent, rgba(0,0,0,0.6));
}

.progress-bar {
  width: 100%;
  height: 3px;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.2s;
}

.progress-bar:active::-webkit-slider-thumb {
  transform: scale(1.2);
}

/* 用户交互面板优化 */
.interaction-panel {
  position: absolute;
  right: 15px;
  bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  color: white;
  z-index: 2;
}

.user-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.follow-btn {
  width: 24px;
  height: 24px;
  margin-top: 8px;
  border-radius: 50%;
  background: #FF0045;
  color: white;
  border: none;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.follow-btn.followed {
  background: #666;
}

/* 操作按钮优化 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.icon-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 32px;
  transition: all 0.2s;
}

.count {
  font-size: 12px;
  margin-top: 4px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

/* 动画效果 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  position: absolute;
}

.scale-enter-from {
  transform: scale(0);
  opacity: 0;
}

.scale-leave-to {
  transform: scale(1.4);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 视频信息优化 */
.video-info {
  color: white;
  margin-bottom: 12px;
}

.video-info h3 {
  margin: 0;
  font-size: 16px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.video-info p {
  margin: 4px 0;
  font-size: 14px;
  opacity: 0.9;
}

.tags {
  display: flex;
  gap: 6px;
  font-size: 12px;
  opacity: 0.8;
}
</style>
