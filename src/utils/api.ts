import axios from 'axios'

interface ApiResponse<T> {
    code: number
    data: T
    message: string
}

// 模拟接口响应
const mockMessages = [{
    id: 1,
    name: "后端用户",
    avatar: "https://picsum.photos/45",
    preview: "来自后端的消息",
    time: new Date().toLocaleTimeString(),
    unread: 0,
    messages: [{
        text: "后端初始化消息",
        time: new Date().toLocaleTimeString(),
        sent: false
    }]
}]

const mockContacts = [{
    id: 1,
    name: "后端联系人",
    avatar: "https://picsum.photos/45",
    initial: "B"
}]

export const fetchMessages = async () => {
    try {
        // 实际项目中替换为真实API调用
        // const res = await axios.get<ApiResponse<Message[]>>('/api/messages')
        return {
            data: mockMessages // 模拟空数据时改为 []
        }
    } catch (error) {
        throw new Error('Failed to fetch messages')
    }
}

export const fetchContacts = async () => {
    try {
        // 实际项目中替换为真实API调用
        // const res = await axios.get<ApiResponse<Contact[]>>('/api/contacts')
        return {
            data: mockContacts // 模拟空数据时改为 []
        }
    } catch (error) {
        throw new Error('Failed to fetch contacts')
    }
}

export const sendMessage = async (payload: {
    chatId: number
    text: string
}) => {
    try {
        // 模拟API响应
        return {
            data: {
                text: payload.text,
                time: new Date().toLocaleTimeString(),
                sent: true
            }
        }
        // 实际调用示例：
        // const res = await axios.post<ApiResponse<ChatMessage>>(
        //   `/api/chats/${payload.chatId}/messages`,
        //   { text: payload.text }
        // )
        // return res.data
    } catch (error) {
        throw new Error('Failed to send message')
    }
}
