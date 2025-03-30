<template>
  <div class="video-container" @touchstart="handleTouchStart" @touchend="handleTouchEnd" ref="videoContainer">
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
        <!-- 在video-info上方添加弹幕按钮 -->
          <button class="danmaku-btn" @click="toggleDanmakuInput">弹</button>
          <div class="video-info">
            <!-- 原有信息 -->
          </div>

          <!-- 弹幕输入框 -->
          <div v-if="showDanmakuInput" class="danmaku-input-box">
            <input
                v-model="danmakuText"
                placeholder="输入弹幕内容"
                @keyup.enter="sendDanmaku"
            >
            <button @click="sendDanmaku">发送</button>
          </div>

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
        <div class="avatar-wrapper">
          <img
              :src="currentVideo.authorAvatar"
              class="avatar"
              @click="navigateToProfile"
          >
          <button
              class="follow-btn"
              @click="toggleFollow"
              :class="{ followed: currentVideo.isFollowing }"
          >
            <svg class="follow-icon" viewBox="0 0 24 24">
              <path v-if="!currentVideo.isFollowing" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              <path v-else d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </button>
        </div>
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
          <div class="count">{{ currentVideo.comments.length }}</div>
        </div>

        <!-- 带过渡效果的遮罩层 -->
        <transition name="fade">
          <div
              v-if="showComments"
              class="comments-overlay"
              @click.self="closeComments"
          >
            <transition name="slide">
              <div
                  v-if="showComments"
                  class="comments-drawer"
              >
                <div class="drawer-header">
                  <h3>视频评论（{{ currentVideo.comments?.length || 0 }}）</h3>
                  <button class="close-btn" @click="closeComments">
                    <svg class="icon" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
                <!-- 评论列表 -->
                <div class="comments-container">
                  <transition-group
                      name="comment-fade"
                      tag="div"
                  >
                    <div
                        v-for="(comment, index) in currentVideo.comments"
                        :key="comment.id || index"
                        class="comment-item"
                    >
                      <div class="user-avatar">
                        <img
                            :src="comment.user.avatar"
                            :alt="comment.user.name"
                            class="avatar-img"
                        >
                      </div>
                      <div class="comment-content">
                        <div class="username">{{ comment.user.name }}</div>
                        <div class="text">{{ comment.content }}</div>
                      </div>
                    </div>
                  </transition-group>
                </div>
              </div>
            </transition>
          </div>
        </transition>
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
    comments: [
      {
        id: 1,
        user: {
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          name: '数码达人王'
        },
        content: '这个特效太炸了！求教程！',
        likes: 142,
        timestamp: 1630454400
      },
      {
        id: 2,
        user: {
          avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
          name: '美妆小仙女💄'
        },
        content: '背景音乐是什么呀？跪求歌名！',
        likes: 89,
        timestamp: 1630447200
      },
      {
        id: 3,
        user: {
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          name: '科技宅小明'
        },
        content: '拍摄设备是用的哪款相机？画质太棒了👏👏',
        likes: 256,
        timestamp: 1630368000
      },
      {
        id: 4,
        user: {
          avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
          name: '旅行家Lily'
        },
        content: '这个地方我去过！实际景色比视频里还美～',
        likes: 302,
        timestamp: 1630281600
      },
      {
        id: 5,
        user: {
          avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
          name: '健身教练Mike'
        },
        content: '动作指导很专业！但新手要注意保护关节哦💪',
        likes: 178,
        timestamp: 1630195200
      },
      {
        id: 6,
        user: {
          avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
          name: '美食探店王'
        },
        content: '看饿了...求餐馆定位！',
        likes: 421,
        timestamp: 1630108800
      }],
    isLiked: false,
    isCollected: false,
    isFollowing: false
  },
  {
    id: 2,
    url: 'http://vjs.zencdn.net/v/oceans.mp4',
    isLandscape: true,
    author: 'user2',
    authorAvatar: 'https://picsum.photos/60',
    title: '第个测试视频',
    tags: ['新', '来'],
    likes: 301,
    collects: 33,
    comments: [
      {
        id: 1,
        user: {
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          name: '数码达人王'
        },
        content: '这个特效太炸了！求教程！',
        likes: 142,
        timestamp: 1630454400
      },
      {
        id: 2,
        user: {
          avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
          name: '美妆小仙女💄'
        },
        content: '背景音乐是什么呀？跪求歌名！',
        likes: 89,
        timestamp: 1630447200
      },
      {
        id: 3,
        user: {
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          name: '科技宅小明'
        },
        content: '拍摄设备是用的哪款相机？画质太棒了👏👏',
        likes: 256,
        timestamp: 1630368000
      },
      {
        id: 4,
        user: {
          avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
          name: '旅行家Lily'
        },
        content: '这个地方我去过！实际景色比视频里还美～',
        likes: 302,
        timestamp: 1630281600
      },
      {
        id: 5,
        user: {
          avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
          name: '健身教练Mike'
        },
        content: '动作指导很专业！但新手要注意保护关节哦💪',
        likes: 178,
        timestamp: 1630195200
      },
      {
        id: 6,
        user: {
          avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
          name: '美食探店王'
        },
        content: '看饿了...求餐馆定位！',
        likes: 421,
        timestamp: 1630108800
      }],
    isLiked: false,
    isCollected: false,
    isFollowing: false
  },
  // 添加更多虚拟视频...
])
// 控制抽屉显示的状态
const showComments = ref(false)

// 切换评论抽屉
// const toggleComments = () => {
//   showComments.value = !showComments.value
// }
// 在script中确保状态声明正确
// const showComments = ref(false)
const toggleComments = () => {
  console.log('触发toggle，当前状态:', showComments.value) // 调试日志
  showComments.value = !showComments.value
}

// 关闭抽屉（支持两种触发方式）
const closeComments = () => {
  showComments.value = false
}
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
// const visibleDanmus = computed(() => {
//   const currentTime = videoElement.value?.currentTime || 0
//   return danmakuList.filter(d =>
//       d.time <= currentTime &&
//       d.time + d.duration > currentTime
//   )
// })

// const sendDanmaku = () => {
//   if (newDanmaku.value.trim()) {
//     danmakuList.push({
//       id: Date.now(),
//       text: newDanmaku.value,
//       position: Math.random() * 80 + 10,
//       duration: 5,
//       time: videoElement.value?.currentTime || 0
//     })
//     newDanmaku.value = ''
//     showDanmakuInput.value = false
//   }
// }

// 视频容器Ref
const videoContainer = ref<HTMLElement>()
// 动画是否进行中
const isAnimating = ref(false)
// 当前滑动距离
const currentTranslateY = ref(0)
// 触摸起始坐标
// const touchStartY = ref(0)
// 触摸时间戳
const touchStartTime = ref(0)

const handleTouchStart = (e: TouchEvent) => {
  if (isAnimating.value) return
  if (e.touches.length === 0) return

  touchStartY.value = e.touches[0].clientY
  console.log('touchStartY', touchStartY.value)
  touchStartTime.value = Date.now()
  videoContainer.value!.style.transition = 'none' // 禁用过渡
}

const handleTouchMove = (e: TouchEvent) => {
  if (isAnimating.value) return

  const currentY = e.touches.clientY
  const deltaY = currentY - touchStartY.value

  // 限制最大滑动距离
  currentTranslateY.value = Math.abs(deltaY) > 200
      ? 200 * (deltaY > 0 ? 1 : -1)
      : deltaY

  applyTransform()
}

const handleTouchEnd = (e: TouchEvent) => {
  if (isAnimating.value) return

  const endY = e.changedTouches[0].clientY
  const deltaY = endY - touchStartY.value
  const deltaTime = Date.now() - touchStartTime.value
  const velocity = deltaY / deltaTime // 计算滑动速度
  console.log(deltaY)
  // 启用过渡动画
  videoContainer.value!.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'

  // 根据速度和距离判断切换方向
  if (Math.abs(deltaY) > 120 || Math.abs(velocity) > 0.3) {
    currentTranslateY.value = deltaY > 0 ? window.innerHeight : -window.innerHeight
    applyTransform()

    setTimeout(() => {
      isAnimating.value = true
      // 切换视频逻辑
      currentIndex.value += deltaY > 0 ? -1 : 1
      // 重置位置
      currentTranslateY.value = 0
      applyTransform()
      // 等待布局更新
      requestAnimationFrame(() => {
        videoContainer.value!.style.transition = 'none'
        isAnimating.value = false
      })
    }, 400)
  } else {
    // 回弹动画
    currentTranslateY.value = 0
    applyTransform()
  }
}

// 应用变换
const applyTransform = () => {
  if (videoContainer.value) {
    videoContainer.value.style.transform = `translateY(${currentTranslateY.value}px)`
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
// 弹幕数据
// const showDanmakuInput = ref(false)
const danmakuText = ref('')
const visibleDanmus = ref([
  // 虚拟数据示例
  { id: 1, text: '前方高能！', position: 15, duration: 8 },
  { id: 2, text: '经典名场面', position: 30, duration: 6 }
])

// 获取视频实例
// const videoElement = ref(null)

// 切换输入框显示
const toggleDanmakuInput = () => {
  showDanmakuInput.value = !showDanmakuInput.value
}

// 发送弹幕逻辑
const sendDanmaku = () => {
  if (!danmakuText.value.trim()) return

  visibleDanmus.value.push({
    id: Date.now(),
    text: danmakuText.value,
    position: getCurrentVideoPosition(),
    duration: calculateDuration(danmakuText.value)
  })

  danmakuText.value = ''
  showDanmakuInput.value = false
}

// 计算弹幕出现位置（基于当前播放进度）
const getCurrentVideoPosition = () => {
  if (!videoElement.value) return 10 // 默认顶部10%位置
  const progress = (videoElement.value.currentTime / videoElement.value.duration) * 100
  return Math.min(Math.max(progress, 5), 95) // 限制在5%-95%区间
}

// // 根据文本长度计算动画时长
// const calculateDuration = (text) => {
//   const baseSpeed = 100 // 像素/秒
//   const textWidth = text.length * 14 // 估算字符宽度
//   return (window.innerWidth + textWidth) / baseSpeed
// }
// 修改后的持续时间计算
const calculateDuration = (text) => {
  const baseSpeed = 150 // 提高移动速度（像素/秒）
  const textWidth = text.length * 14 // 保持字符宽度估算
  return (window.innerWidth + textWidth) / baseSpeed
}
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
  overflow: hidden;
  background: #000;
  height: 100vh;
  display: flex;
  justify-content: center;
}
/* 横屏视频适配 */
.landscape video {
  width: 100%;
  object-fit: contain;
}

/* 竖屏视频适配 */
.portrait video {
  height: 100%;
  object-fit: cover;
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
  z-index: 100;
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
  /* 基础样式 */
  color: white;
  margin-bottom: 12px;

  /* 对齐控制 */
  text-align: left;
  align-self: flex-start; /* 如果父级是flex布局 */

  /* 内容宽度控制 */
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  /* 内部元素间距 */
  & h3, & p, & .tags {
    margin-left: 0;
    margin-right: auto; /* 保持左对齐惯性 */
  }
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
/* 评论按钮样式 */
.action-item {
  cursor: pointer;
  padding: 8px;
  transition: transform 0.2s;
}

/* 遮罩层样式 */
.comments-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

/* 抽屉主体样式 */
.comments-drawer {
  background: white;
  border-radius: 16px 16px 0 0;
  max-height: 80vh;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 抽屉头部 */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.close-btn {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 8px;
}

/* 可滚动评论区域 */
.comments-container {
  overflow-y: auto;
  padding: 16px;
  flex-grow: 1;
}

/* 单条评论样式 */
.comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.comment-content {
  flex-grow: 1;
}

.username {
  font-weight: 500;
  margin-bottom: 4px;
}

.text {
  color: #666;
  line-height: 1.4;
}
/* 遮罩层淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 抽屉滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
}

/* 核心布局 */
.comments-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.comments-drawer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50vh; /* 屏幕高度一半 */
  background: #fff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.drawer-header {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 0.7;
}

.icon {
  width: 24px;
  height: 24px;
  fill: #666;
}

.comments-container {
  height: calc(50vh - 64px); /* 计算可用高度 */
  overflow-y: auto;
  padding: 16px 24px;
}

/* 优化滚动条 */
.comments-container::-webkit-scrollbar {
  width: 6px;
}

.comments-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

.comments-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .comments-drawer {
    height: 60vh; /* 移动端显示更多内容 */
  }

  .comments-container {
    height: calc(60vh - 64px);
  }
}
.action-buttons {
  display: flex;
  gap: 20px;
  padding: 12px 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  /* 移除默认点击效果 */
  background: none;
  border: none;
  outline: none;
  padding: 8px;
  /* 防止文字选中 */
  user-select: none;
}

/* 移除按钮点击轮廓 */
.action-item:focus {
  outline: none;
  box-shadow: none;
}

.icon-wrapper {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 移除背景边框 */
  background: none;
  border: none;
}

.icon {
  font-size: 24px;
  /* 移除文本阴影 */
  text-shadow: none;
  transition: all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  /* 修复emoji对齐问题 */
  line-height: 1;
  transform: translateY(2px);
}

/* 点击动画 */
.action-item:active .icon {
  transform: scale(0.9);
}

.count {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-family: system-ui;
}

/* 过渡效果优化 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
  position: absolute;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(4px);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(1.2) translateY(-4px);
}

/* 悬停效果 */
.action-item:hover {
  transform: translateY(-2px);
}

.action-item:hover .icon {
  filter: brightness(1.1);
}

/* 已点赞/收藏状态 */
.action-item[data-active="true"] .icon {
  filter: drop-shadow(0 2px 4px rgba(255, 65, 65, 0.2));
}
.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: block;
  cursor: pointer;
  transition: transform 0.2s ease;
}

/* 精确调整关注按钮 */
.follow-btn {
  position: absolute;
  bottom: -4px;  /* 更靠近头像 */
  left: 50%;
  transform: translateX(-50%);
  width: 20px;    /* 更小尺寸 */
  height: 20px;
  border-radius: 50%;
  background: #FE2C55;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;  /* 确保在头像上方 */
}

/* 超小尺寸图标 */
.follow-icon {
  width: 10px;  /* 缩小图标 */
  height: 10px;
  fill: #fff;
  transition: all 0.2s ease;
}

/* 已关注状态完全隐藏按钮 */
.follow-btn.followed {
  opacity: 0;
  transform: translateX(-50%) scale(0);
}

/* 悬停交互优化 */
.follow-btn:not(.followed):hover {
  background: #ff4769;
  transform: translateX(-50%) scale(1.1);
}

/* 点击动画 */
.follow-btn:active {
  transform: translateX(-50%) scale(0.9);
}

/* 头像悬停效果 */
.avatar:hover {
  transform: scale(1.05);
}
.video-container {
  width: 100vw;
  height: 100vh;
  will-change: transform; /* 优化动画性能 */

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }

  /* 滑动时显示下方视频预览 */
  &::after {
    content: '';
    position: absolute;
    bottom: -10%;
    left: 5%;
    width: 90%;
    height: 20%;
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%);
    border-radius: 8px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  &.swiping::after {
    opacity: 0.4;
  }
}
/* 弹幕按钮样式 */
.danmaku-btn {
  position: absolute;
  left: 12px;
  top: -36px;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.5);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  opacity: 0.8;
  transition: all 0.3s;
  z-index: 1001;
}

/* 输入框样式 */
.danmaku-input-box {
  position: absolute;
  left: 60px;
  top: -40px;
  background: rgba(0,0,0,0.8);
  padding: 8px;
  border-radius: 4px;
  display: flex;
  gap: 8px;

  input {
    background: transparent;
    border: 1px solid #666;
    color: white;
    padding: 4px 8px;
    width: 200px;
  }

  button {
    background: #00aeec;
    color: white;
    border: none;
    padding: 4px 12px;
    border-radius: 2px;
  }
}

/* 弹幕动画 */
.danmu {
  position: absolute;
  white-space: nowrap;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  animation: danmaku-scroll linear forwards;
  font-size: 14px;
  left: 100%;       /* 从屏幕右侧外开始 */
}

@keyframes danmaku-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - 100vw)); /* 完全移出左侧 */
  }
}
</style>
