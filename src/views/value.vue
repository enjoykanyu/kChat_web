<!-- App.vue -->
<template>
  <div class="container"
       @touchstart="handleTouchStart"
       @touchend="handleTouchEnd"
       @click="handleVideoClick">
    <!-- 视频流容器 -->
    <div class="video-container" :style="videoContainerStyle">
      <div v-for="(video, index) in videoList"
           :key="video.id"
           class="video-wrapper">
        <video
            @ended="handleVideoEnd(index)"
          ref="videoPlayers"
            :src="video.url"
            autoplay
            class="video-element"
            @timeupdate="handleTimeUpdate(index)"
            @loadedmetadata="handleLoadedMetadata(index)"
        ></video>

        <!-- 弹幕区域 -->
        <div class="danmaku-layer">
          <div v-for="danmaku in activeDanmaku(index)"
               :key="danmaku.id"
               class="danmaku-item"
               :style="danmakuStyle(danmaku)">
            {{ danmaku.text }}
          </div>
        </div>

        <!-- 右侧交互区 -->
        <div class="interaction-panel">
          <div class="author-info" @click="toggleFollow(video.author)">
            <img :src="video.author.avatar" class="avatar"/>
            <span class="follow-tip">{{ video.author.isFollowed ? '已关注' : '关注' }}</span>
          </div>
          <div class="action-btn" @click="handleLike(video)">
            <heart-icon :filled="video.isLiked"/>
            <span>{{ video.likes }}</span>
          </div>
          <div class="action-btn" @click="showCommentDrawer = true">
            <comment-icon/>
            <span>{{ video.comments.length }}</span>
          </div>
          <div class="action-btn" @click="showDanmakuInput(video)">
            <danmaku-icon/>
          </div>
        </div>
      </div>
    </div>
    <!-- 新增加载提示 -->
    <div v-if="isLoading" class="loading-tip">
      ⌛ 正在加载更多视频...
    </div>
    <!-- 进度条 -->
    <input type="range"
           class="progress-bar"
           :min="0"
           :max="duration"
           v-model="currentTime"
           @input="handleSeek"/>

    <!-- 弹幕输入 -->
    <div v-if="showDanmaku" class="danmaku-input">
      <input v-model="danmakuText" @keyup.enter="sendDanmaku"/>
      <button @click="sendDanmaku">发送</button>
    </div>

    <!-- 评论抽屉 -->
    <transition name="slide-up">
      <div v-if="showCommentDrawer" class="comment-drawer">
        <div class="drawer-header">
          <h3>评论（{{ currentVideo.comments.length }}）</h3>
          <button @click="showCommentDrawer = false">关闭</button>
        </div>
        <div class="comment-list">
          <div v-for="comment in currentVideo.comments"
               :key="comment.id"
               class="comment-item">
            <img :src="comment.user.avatar" class="avatar"/>
            <div class="content">
              <strong>{{ comment.user.name }}</strong>
              <p>{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'

// 虚拟数据结构
interface User {
  id: number
  name: string
  avatar: string
  isFollowed: boolean
}

interface Danmaku {
  id: number
  text: string
  time: number
  color: string
  position: number
}

interface Comment {
  id: number
  user: User
  content: string
}

interface VideoItem {
  id: number
  url: string
  likes: number
  isLiked: boolean
  author: User
  comments: Comment[]
  danmaku: Danmaku[]
  duration: number
}
// 在setup中添加
import { onMounted } from 'vue'

onMounted(() => {
  nextTick(() => {
    if (videoPlayers.value) {
      videoPlayers.value.play().catch(err => {
        console.log('自动播放失败:', err)
      })
    }
  })
})

const handleLoadedMetadata = (index: number) => {
  const player = videoPlayers.value[index]
  if (player) {
    duration.value = player.duration
    // 确保自动播放
    player.play().catch(err => {
      console.error('视频播放失败:', err)
      // 可在此处添加播放按钮显示逻辑
    })
  }
}

// 生成虚拟数据
const generateMockData = (): VideoItem[] => [
  {
    id: 1,
    url: 'https://www.runoob.com/try/demo_source/movie.mp4', // 更换为有效视频源
    likes: 2345,
    isLiked: false,
    author: {
      id: 1001,
      name: '旅行日记',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      isFollowed: false
    },
    comments: [
      {
        id: 1,
        user: {
          id: 1002,
          name: '用户A',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          isFollowed: false
        },
        content: '这个视频拍得太棒了！'
      }
    ],
    danmaku: [],
    duration: 0
  },
  {
    id: 2,
    url: 'https://www.runoob.com/try/demo_source/movie.mp4', // 更换为有效视频源
    likes: 2345,
    isLiked: false,
    author: {
      id: 1002,
      name: '旅行日记',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      isFollowed: false
    },
    comments: [
      {
        id: 1,
        user: {
          id: 1002,
          name: '用户A',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          isFollowed: false
        },
        content: '这个视频拍得太棒了！'
      }
    ],
    danmaku: [],
    duration: 0
  },

  // 可添加更多视频数据...
]

// 组件逻辑
const videoList = reactive<VideoItem[]>(generateMockData())
const currentIndex = ref(0)
const videoPlayers = ref<HTMLVideoElement[]>([])
const currentTime = ref(0)
const duration = ref(0)
const showCommentDrawer = ref(false)
const showDanmaku = ref(false)
const danmakuText = ref('')

// 当前视频控制
const currentVideo = computed(() => videoList[currentIndex.value])
const currentPlayer = computed(() => videoPlayers.value[currentIndex.value])

// 视频容器样式
const videoContainerStyle = computed(() => ({
  transform: `translateY(-${currentIndex.value * 100}vh)`,
  transition: 'transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)'
}))

// 弹幕处理
const activeDanmaku = (index: number) =>
    videoList[index].danmaku.filter(d =>
        Math.abs(d.time - currentTime.value) < 0.5
    )

const danmakuStyle = (danmaku: Danmaku) => ({
  color: danmaku.color,
  top: `${danmaku.position}%`,
  animation: `move ${Math.random() * 5 + 5}s linear`
})

// 手势处理
let startY = 0
const handleTouchStart = (e: TouchEvent) => {
  startY = e.touches.clientY
}

// const handleTouchEnd = (e: TouchEvent) => {
//   const deltaY = e.changedTouches.clientY - startY
//   if (Math.abs(deltaY) > 50) {
//     currentIndex.value = Math.max(0,
//         Math.min(videoList.length - 1,
//             currentIndex.value + (deltaY > 0 ? -1 : 1)
//         )
//     )
//     nextTick(() => currentPlayer.value?.play())
//   }
// }

// 视频控制
const handleVideoClick = () => {
  if (currentPlayer.value) {
    currentPlayer.value.paused ?
        currentPlayer.value.play() :
        currentPlayer.value.pause()
  }
}

let lastTap = 0
const handleDoubleClick = () => {
  const now = Date.now()
  if (now - lastTap < 300) {
    handleLike(currentVideo.value)
  }
  lastTap = now
}

const handleLike = (video: VideoItem) => {
  video.isLiked = !video.isLiked
  video.likes += video.isLiked ? 1 : -1
}

// 进度条控制
const handleSeek = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (currentPlayer.value) {
    currentPlayer.value.currentTime = parseFloat(target.value)
  }
}

// 弹幕发送
const sendDanmaku = () => {
  if (danmakuText.value.trim()) {
    currentVideo.value.danmaku.push({
      id: Date.now(),
      text: danmakuText.value,
      time: currentTime.value,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      position: Math.random() * 80
    })
    danmakuText.value = ''
    showDanmaku.value = false
  }
}
// 增加新功能需要的修改部分
import { ref, reactive, computed, nextTick, onMounted } from 'vue'

// 在原有代码基础上增加以下内容

// 视频循环播放
const handleVideoEnd = (index: number) => {
  const player = videoPlayers.value[index]
  if (player) {
    player.currentTime = 0
    player.play().catch(err => console.log('循环播放失败:', err))
  }
}

// 下拉刷新功能
let isLoading = false
const fetchMoreVideos = async () => {
  if (isLoading) return
  isLoading = true

  // 模拟网络请求
  await new Promise(resolve => setTimeout(resolve, 1000))

  const newVideos = generateMockData().map(v => ({
    ...v,
    id: Date.now() + Math.random()
  }))

  videoList.push(...newVideos)
  isLoading = false
}

// 修改触摸处理逻辑
const handleTouchEnd = (e: TouchEvent) => {
  const deltaY = e.changedTouches.clientY - startY
  const isSwipeDown = deltaY > 50
  const isSwipeUp = deltaY < -50

  // 下拉刷新（当在第一个视频时下拉）
  if (isSwipeDown && currentIndex.value === 0) {
    fetchMoreVideos()
    return
  }

  // 上滑加载更多
  if (isSwipeUp && currentIndex.value === videoList.length - 1) {
    fetchMoreVideos()
    currentIndex.value += 1
    return
  }

  // 原有滑动逻辑
  if (Math.abs(deltaY) > 50) {
    currentIndex.value = Math.max(0,
        Math.min(videoList.length - 1,
            currentIndex.value + (deltaY > 0 ? -1 : 1)
        )
    )
    nextTick(() => currentPlayer.value?.play())
  }
}
</script>

<style>
/* 基础样式 */
.container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #000;
}

.video-container {
  height: 100vh;
  width: 100vw;
}

.video-wrapper {
  height: 100vh;
  width: 100vw;
  position: relative;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 交互面板 */
.interaction-panel {
  position: absolute;
  right: 16px;
  bottom: 120px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: white;
}

.author-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  border: 2px solid white;
}

.follow-tip {
  font-size: 12px;
  margin-top: 4px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

/* 弹幕样式 */
.danmaku-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.danmaku-item {
  position: absolute;
  white-space: nowrap;
  font-size: 18px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

@keyframes move {
  from { transform: translateX(100vw); }
  to { transform: translateX(-100%); }
}

/* 进度条 */
.progress-bar {
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  width: 95%;
  margin: 0 auto;
  height: 3px;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.2);
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
}

/* 评论抽屉 */
.comment-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60vh;
  background: white;
  padding: 16px;
  border-radius: 16px 16px 0 0;
}

.slide-up-enter-active {
  transition: transform 0.3s ease-out;
}
.slide-up-leave-active {
  transition: transform 0.3s ease-in;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
/* 新增加载提示样式 */
.loading-tip {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  background: rgba(0,0,0,0.7);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

/* 修改滑动过渡效果 */
.video-container {
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
