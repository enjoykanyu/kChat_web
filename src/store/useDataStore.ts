// stores/useDataStore.ts
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { mockApi } from '../utils/api'

export const useDataStore = defineStore('data', () => {
    const currentView = ref('messages')
    const selectedChat = ref<number | null>(null)
    const showProfile = ref(false)
    const showMoment = ref(false)

    const state = reactive({
        user: {
            id: 0,
            name: '当前用户',
            avatar: 'user-avatar.jpg',
            moments: [
                { id: 1, content: '今天天气不错', images: [], time: '2023-07-20' }
            ]
        },
        messages: [] as any[],
        friends: [] as any[],
        chatHistory: [] as any[]
    })

    const loadData = async () => {
        state.messages = (await mockApi.getMessages()).data
        state.friends = (await mockApi.getFriends()).data
    }

    return {
        currentView,
        selectedChat,
        showProfile,
        showMoment,
        state,
        loadData
    }
})
